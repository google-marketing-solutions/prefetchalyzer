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

import { HarStore } from '../stores/har'
import { ResourceURL } from '@/models/resource'
import { PageId } from '@/models/page'
import { ParsedHAR, JsonObject } from '@/models/app-data'

/**
 * A simple factory for loading a string input into a valid HAR store instance
 */
export function buildHarFromString(har: string): HarStore {
  let rawHar: JsonObject

  try {
    rawHar = JSON.parse(har)
  } catch (e) {
    throw new Error('Invalid JSON structure in HAR')
  }

  if (typeof (rawHar.log) === 'undefined' ||
      typeof (rawHar.log.pages) === 'undefined' ||
      typeof (rawHar.log.entries) === 'undefined') {
    throw new Error('Missing required HAR properties, log, pages or entries')
  }

  return new HarStore(rawHar)
}

export function parseHARFile(harFile: string): ParsedHAR {
  const har = JSON.parse(harFile)
  const parsedHAR: ParsedHAR = {
    pages: [],
    resources: []
  }
  // TODO: consider validation of HAR file using: https://github.com/google/har2csv/blob/main/index.js
  // extract requests; using URL as identifier
  const requests: Record<ResourceURL, any> = {} // TODO: better work on Resource objects directly
  const pageTransferSizes: Record<PageId, number> = {}
  // TODO: consider using a TS type definition for HAR file,
  // example: https://github.com/micmro/har-format-ts-declaration
  // Needs strong type checking on all extracted data anyway
  har.log.entries.forEach((entry: any) => {
    // calculate to page total size before filtering
    if (!pageTransferSizes[entry.pageref]) {
      pageTransferSizes[entry.pageref] = 0
    }
    pageTransferSizes[entry.pageref] += entry.response._transferSize // TODO: fragile?
    // basic filtering of requests
    // only successful requests
    if (entry.response.status !== 200) return
    // only critical assets and fonts
    if (!entry._resourceType.match(/script|stylesheet|document|font/)) return
    if (requests[entry.request.url]) {
      // if entry already exists, only add pageref into pages array
      // TODO: this works directly on the HAR file's data structure, better build Resource object directly
      requests[entry.request.url].pages.push(entry.pageref)
    } else {
      // else create entry for this request
      // find cache-control header value
      const cacheHeader = entry.response.headers.find((header: any) => header.name === 'cache-control') // TODO: match to HAR file's data type instead of 'any'
      const cacheControl = cacheHeader ? cacheHeader.value : null
      requests[entry.request.url] = {
        url: entry.request.url,
        cacheControl,
        transferSize: entry.response._transferSize,
        pages: [entry.pageref],
        selectedPrefetch: true,
        prefetchOn: null
      }
    }
  })
  // add requests
  parsedHAR.resources = Object.values(requests)
  // TODO: replace 'any' types
  har.log.pages
    .sort((a: any, b: any) => (a.startedDateTime > b.startedDateTime ? 1 : -1))
    .forEach((page: any) =>
      parsedHAR.pages.push({
        id: page.id,
        label: page.id,
        url: page.title,
        transferSize: pageTransferSizes[page.id] ? pageTransferSizes[page.id] : 0
      })
    )
  return parsedHAR
}
