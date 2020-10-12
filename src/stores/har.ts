/// <reference path='./objectron.d.ts'/>
import { Resource, ResourceURL } from '@/models/resource'
import { Page, PageId } from '@/models/page'
import { TransferSizes } from '@/models/transfer-sizes'
import match from '@menadevs/objectron'


export class HarStore {
  pages: Array<Record<string, any>>
  entries: Array<Record<string, any>>

  constructor(rawHar: Record<string, any>) {
    this.pages = rawHar.log.pages
    this.entries = []

    rawHar.log.entries.forEach((entry: any) => {
      const extractedEntry = this.extractEntry(entry)
      if(extractedEntry.match) {
        this.entries.push(extractedEntry)
      }
    })
  }

  /**
   * Parses and extracts data from a single HAR entry based on a regex based schema
   */
  extractEntry(entry: Record<string, any>):Record<string, any> {
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
    const result = {
      match: matchResult.match,
      ...matchResult.groups
    }

    // Temporary workaround until a library fix is released
    // https://github.com/mena-devs/objectron/issues/24 
    result.status = parseInt(result.status)
    result.transferSize = parseInt(result.transferSize)

    // TODO: Find a way to mark a request as 3rd party true of false, which can help out in the analysis

    if (!result.hasOwnProperty('cacheControl')) {
      result['cacheControl'] = null
    }

    return result
  }

  /**
   * Calculates the transfer size by page based on the entries on the object
   */
  getPageTransferSizes():TransferSizes {
    const transferSizes:TransferSizes = {}

    this.entries.forEach((entry:Record<string, any>) => {
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

    this.entries.forEach((entry:Record<string, any>) => {
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

    this.entries.forEach((entry) => {
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

    return this.pages.map((page:any) => {
      return {
        id: page.id,
        label: page.id,
        url: page.title,
        transferSize: pageTransferSizes[page.id] ? pageTransferSizes[page.id] : 0
      }
    })
  }
}
