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
import match from '@menadevs/objectron'

export class HarStore {
  pages: Array<HarPage>
  entries: Array<HarEntry>

  constructor(rawHar: JsonObject) {
    this.pages = []
    this.entries = []

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
  }

  /**
   * Parses and extracts the relevant properties from a page entry in the raw HAR object
   */
  extractPage(entry: JsonObject): HarPage|null {
    const pagePattern = {
      startedDateTime: /(?<startedDateTime>.*)/,
      id: /(?<id>page_\d+)/,
      title: /(?<title>https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/
    }

    const matchResult = match(entry, pagePattern)

    return (matchResult.match) ? matchResult.groups : null
  }

  /**
   * Parses and extracts data from a single HAR entry based on a regex based schema
   */
  extractEntry(entry: JsonObject): HarEntry|null {
    const baseEntryPattern = {
      pageref: /(?<pageRef>page_\d+)/,
      _priority: /(?<priority>.*)/,
      _resourceType: /(?<resourceType>script|stylesheet|document|font)/,
      request: {
        method: /(?<method>GET|POST)/,
        url: /(?<url>https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/,
        httpVersion: /(?<httpVersion>.*)/
      },
      response: {
        status: /^(?<status>[0-9]{3})/,
        headers: [
          { name: /cache-control/i, value: /(?<cacheControl>.*)/ }
        ],
        _transferSize: /(?<transferSize>\d+)/
      }
    }

    const matchResult = match(entry, baseEntryPattern)

    if (matchResult.match) {
      const result = matchResult.groups

      // Temporary workaround until a library fix is released
      // https://github.com/mena-devs/objectron/issues/24
      result.status = parseInt(result.status)
      result.transferSize = parseInt(result.transferSize)

      if (typeof (result.cacheControl) === 'undefined') {
        result.cacheControl = null
      }

      return result
    }

    return null
  }

  /**
   * Calculates the transfer size by page based on the entries on the object
   */
  getPageTransferSizes(): TransferSizes {
    const transferSizes: TransferSizes = {}

    this.entries.forEach((entry: HarEntry) => {
      if (typeof (transferSizes[entry.pageRef]) === 'undefined') {
        transferSizes[entry.pageRef] = 0
      }

      transferSizes[entry.pageRef] += entry.transferSize
    })

    return transferSizes
  }

  /**
   * Maps each entry URL to a list of pages
   */
  getUrlPageOccurences(): Record<ResourceURL, Array<PageId>> {
    const urlPageMap: Record<ResourceURL, Array<PageId>> = {}

    this.entries.forEach((entry: HarEntry) => {
      if (typeof (urlPageMap[entry.url]) !== 'undefined') {
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
  getResources(): Array<Resource> {
    const urlPagesMap = this.getUrlPageOccurences()
    const resources: Record<ResourceURL, Resource> = {}

    this.entries.forEach((entry: HarEntry) => {
      if (typeof (resources[entry.url]) === 'undefined') {
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
  getPages(): Array<Page> {
    const pageTransferSizes = this.getPageTransferSizes()

    return this.pages.map((page: HarPage) => {
      return {
        id: page.id,
        label: page.id,
        url: page.title,
        transferSize: pageTransferSizes[page.id] ? pageTransferSizes[page.id] : 0
      }
    })
  }
}
