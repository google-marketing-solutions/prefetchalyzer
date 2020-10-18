/// <reference path='./objectron.d.ts'/>
import { Resource, ResourceURL } from '@/models/resource'
import { Page, PageId } from '@/models/page'
import { TransferSizes } from '@/models/transfer-sizes'
import { HarEntry } from '@/models/har-entry'
import { HarPage } from '@/models/har-page'
import match from '@menadevs/objectron'


export class HarStore {
  pages: Array<HarPage>
  entries: Array<HarEntry>

  constructor(rawHar: Record<string, any>) {
    this.pages = []
    this.entries = []

    rawHar.log.entries.forEach((entry: any) => {
      const extractedEntry = this.extractEntry(entry)

      if (extractedEntry != null) {
        this.entries.push(extractedEntry)
      }
    })

    rawHar.log.pages.forEach((page: any) => {
      const extractedPage = this.extractPage(page)

      if (extractedPage != null) {
        this.pages.push(extractedPage)
      }
    })
  }

  /**
   * Parses and extracts the relevant properties from a page entry in the raw HAR object
   */
  extractPage(entry: Record<string, any>):HarPage|null {
    const pagePattern = {
      startedDateTime: /(?<startedDateTime>.*)/,
      id: /(?<id>page_\d+)/,
      title: /(?<title>https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/
    }

    const matchResult = match(entry, pagePattern)

    return (matchResult.match)? matchResult.groups : null
  }

  /**
   * Parses and extracts data from a single HAR entry based on a regex based schema
   */
  extractEntry(entry: Record<string, any>):HarEntry|null {
    const baseEntryPattern = {
      pageref: /(?<pageRef>page_\d+)/,
      _priority: /(?<priority>.*)/,
      _resourceType: /(?<resourceType>script|stylesheet|document|font)/,
      request: {
        method: /(?<method>GET|POST)/,
        url: /(?<url>https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/,
        httpVersion: /(?<httpVersion>.*)/,
      },
      response: {
        status: /^(?<status>[0-9]{3})/,
        headers: [
          { name: /cache-control/i, value: /(?<cacheControl>.*)/ },
        ],
        _transferSize: /(?<transferSize>\d+)/
      },
    }

    const matchResult = match(entry, baseEntryPattern)

    if (matchResult.match) {
      const result = matchResult.groups

      // Temporary workaround until a library fix is released
      // https://github.com/mena-devs/objectron/issues/24
      result.status = parseInt(result.status)
      result.transferSize = parseInt(result.transferSize)

      if (!result.hasOwnProperty('cacheControl')) {
        result['cacheControl'] = null
      }

      return result
    }

    return null
  }

  /**
   * Calculates the transfer size by page based on the entries on the object
   */
  getPageTransferSizes():TransferSizes {
    const transferSizes:TransferSizes = {}

    this.entries.forEach((entry:HarEntry) => {
      if (!transferSizes.hasOwnProperty(entry.pageRef)) {
        transferSizes[entry.pageRef] = 0
      }

      transferSizes[entry.pageRef] += entry.transferSize
    })

    return transferSizes
  }

  /**
   * Maps each entry URL to a list of pages
   */
  getUrlPageOccurences():Record<ResourceURL, Array<PageId>> {
    const urlPageMap:Record<ResourceURL, Array<PageId>> = {}

    this.entries.forEach((entry:HarEntry) => {
      if (urlPageMap.hasOwnProperty(entry.url)) {
        urlPageMap[entry.url].push(entry.pageRef)
      } else {
        urlPageMap[entry.url] = [entry.pageRef]
      }
    })

    return urlPageMap
  }

  /**
   * Returns a list of resources based on the entry data
   * TODO: Update with method params to enable filtering options on resources
   */
  getResources():Array<Resource> {
    const urlPagesMap = this.getUrlPageOccurences()
    const resources:Record<ResourceURL, Resource> = {}

    this.entries.forEach((entry:HarEntry) => {
      if(!resources.hasOwnProperty(entry.url)) {
        resources[entry.url] = {
          url: entry.url,
          cacheControl: entry.cacheControl,
          transferSize: entry.transferSize,
          pages: urlPagesMap[entry.url],
          selectedPrefetch: true,
          prefetchOn: null
        }
      }
    })

    return Object.values(resources)
  }

  /**
   * Returns a list of sorted pages along with their transfer sizes
   */
  getPages():Array<Page> {
    const pageTransferSizes = this.getPageTransferSizes()

    return this.pages.map((page:HarPage) => {
      return {
        id: page.id,
        label: page.id,
        url: page.title,
        transferSize: pageTransferSizes[page.id] ? pageTransferSizes[page.id] : 0
      }
    })
  }
}
