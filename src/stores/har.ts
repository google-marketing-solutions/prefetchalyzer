/**
 * Copyright 2020 Google LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 **/

/// <reference path='./objectron.d.ts'/>
import { Resource, ResourceURL } from '@/models/resource'
import { Page, PageId } from '@/models/page'
import { TransferSizes } from '@/models/transfer-sizes'
import { HarEntry } from '@/models/har-entry'
import { HarPage } from '@/models/har-page'
import { JsonObject } from '@/models/app-data'
import { HarDebugLog } from '@/models/har-debug-log'
import { convertMimeTypeToResourceType } from '@/utils/har-utils'
import match from '@menadevs/objectron'

export class HarStore {
  pages: Array<HarPage>
  entries: Array<HarEntry>
  debugLog: HarDebugLog

  constructor(rawHar: JsonObject) {
    this.pages = []
    this.entries = []
    this.debugLog = {
      hasTransferSize: false,
      hasResourceType: false,
      invalidPages: [],
      invalidEntries: [],
      statistics: {
        totalPages: rawHar.log.pages.length,
        validPages: -1,
        totalEntries: rawHar.log.entries.length,
        validEntries: -1
      }
    }

    rawHar.log.entries.forEach((entry: JsonObject) => {
      const extractedEntry = this.extractEntry(entry)

      if (extractedEntry != null) {
        this.entries.push(extractedEntry)
      }
    })

    rawHar.log.pages.forEach((page: JsonObject) => {
      const extractedPage = this.extractPage(page)

      if (extractedPage != null) {
        this.pages.push(extractedPage)
      }
    })

    this.debugLog.statistics.validPages = this.pages.length
    this.debugLog.statistics.validEntries = this.entries.length

    // expose debug log for easy access in production
    const myWindow = window as unknown as {harDebugLog: HarDebugLog}
    myWindow.harDebugLog = this.debugLog
  }

  /**
   * Parses and extracts the relevant properties from a page entry in the raw HAR object
   */
  extractPage(page: JsonObject): HarPage | null {
    const pagePattern = {
      startedDateTime: /(?<startedDateTime>.*)/,
      id: /(?<id>.+)/,
      title: /(?<title>.+)/
    }

    const matchResult = match(page, pagePattern)

    if (matchResult.match) {
      const result = matchResult.groups
      const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/

      result.url = null
      // some HAR generators use the title to store the page URL
      if (result.title.match(urlRegex)) {
        result.url = result.title
      } else {
        // otherwise find first valid document request for this page to set URL
        for (let i = 0; i < this.entries.length; i++) {
          if (this.entries[i].pageRef === result.id && this.entries[i].resourceType === 'document') {
            result.url = this.entries[i].url
            break
          }
        }
      }

      return result
    } else {
      this.debugLog.invalidPages.push({
        item: page,
        issue: 'Did not match expected pattern'
      })
    }

    return null
  }

  /**
   * Parses and extracts data from a single HAR entry based on a regex based schema
   */
  extractEntry(entry: JsonObject): HarEntry | null {
    // unofficial properties commented out for reference (used in analysis, if available)
    const baseEntryPattern = {
      pageref: /(?<pageRef>.+)/,
      // _priority: /(?<priority>.*)/,
      // _resourceType: /(?<resourceType>script|stylesheet|document|font)/,
      request: {
        method: /(?<method>GET|POST)/i,
        url: /(?<url>https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/,
        httpVersion: /(?<httpVersion>.*)/
      },
      response: {
        status: /^(?<status>200)/,
        headers: [
          { name: /cache-control/i, value: /(?<cacheControl>.*)/ }
        ],
        content: {
          mimeType: /(?<resourceType>.*)/,
          size: /(?<size>\d+)/
        }
        // _transferSize: /(?<transferSize>\d+)/
      }
    }

    const matchResult = match(entry, baseEntryPattern)

    if (matchResult.match) {
      const result = matchResult.groups

      // check for _resourceType (use of resource in terms of browser engine)
      if (entry._resourceType && entry._resourceType.match(/script|stylesheet|document|font/)) {
        result.resourceType = entry._resourceType
        if (!this.debugLog.hasResourceType) {
          this.debugLog.hasResourceType = true
        }
      } else {
        const resourceType = convertMimeTypeToResourceType(result.resourceType)
        if (resourceType != null) {
          result.resourceType = resourceType
        } else {
          this.debugLog.invalidEntries.push({
            item: entry,
            issue: `sdf valid or relevant resourceType found in entry: ${result.resourceType}`
          })
          return null
        }
      }

      // Temporary workaround until a library fix is released
      // https://github.com/mena-devs/objectron/issues/24
      result.status = parseInt(result.status)

      // check for _transferSize field (more meaningful for prefetch)
      if (entry.response && entry.response._transferSize && RegExp(/\d+/).test(entry.response._transferSize)) {
        result.size = parseInt(entry.response._transferSize)
        if (!this.debugLog.hasTransferSize) {
          this.debugLog.hasTransferSize = true
        }
      } else {
        result.size = parseInt(result.size)
      }

      if (entry._priority && entry._priority.match(/.+/)) {
        result.priority = entry._priority
      } else {
        result.priority = null
      }

      if (typeof (result.cacheControl) === 'undefined') {
        result.cacheControl = null
      }

      return result
    } else {
      let issue = 'Did not match expected pattern'
      if (entry.response && entry.response.status !== 200) {
        issue += `, status ${entry.response.status}`
      }
      if (entry.request && entry.request.method && !entry.request.method.match(/GET|POST/i)) {
        issue += `, method ${entry.request.method}`
      }

      this.debugLog.invalidEntries.push({
        item: entry,
        issue
      })
    }

    return null
  }

  /**
   * Calculates the total size by page based on the entries on the object
   */
  getPageSizes(): TransferSizes {
    const transferSizes: TransferSizes = {}

    this.entries.forEach((entry: HarEntry) => {
      if (typeof (transferSizes[entry.pageRef]) === 'undefined') {
        transferSizes[entry.pageRef] = 0
      }

      transferSizes[entry.pageRef] += entry.size
    })

    return transferSizes
  }

  /**
   * Maps each entry URL to a list of pages
   */
  getUrlPageOccurences(): Record<ResourceURL, Set<PageId>> {
    const urlPageMap: Record<ResourceURL, Set<PageId>> = {}

    this.entries.forEach((entry: HarEntry) => {
      if (typeof (urlPageMap[entry.url]) !== 'undefined') {
        urlPageMap[entry.url].add(entry.pageRef)
      } else {
        urlPageMap[entry.url] = new Set([entry.pageRef])
      }
    })

    return urlPageMap
  }

  /**
   * Returns a list of resources based on the entry data.
  */
  getResources(): Array<Resource> {
    const urlPagesMap = this.getUrlPageOccurences()
    const resources: Record<ResourceURL, Resource> = {}

    this.entries.forEach((entry: HarEntry) => {
      if (typeof (resources[entry.url]) === 'undefined') {
        resources[entry.url] = {
          url: entry.url,
          cacheControl: entry.cacheControl,
          size: entry.size,
          pages: urlPagesMap[entry.url],
          resourceType: entry.resourceType,
          selectedPrefetch: true,
          prefetchOn: null
        }
      }
    })

    return Object.values(resources)
  }

  /**
   * Returns a list of sorted pages along with their sizes (transfer size or on disk)
   */
  getPages(): Array<Page> {
    const pageSizes = this.getPageSizes()
    return this.pages
      .sort((a: HarPage, b: HarPage) => (a.startedDateTime > b.startedDateTime ? 1 : -1))
      .map((page: HarPage) => {
        return {
          id: page.id,
          label: page.id,
          url: page.url,
          size: pageSizes[page.id] ? pageSizes[page.id] : 0
        }
      })
  }
}
