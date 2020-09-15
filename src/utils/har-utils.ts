import { ResourceURL } from '@/models/resource'
import { PageId } from '@/models/page'
import { ParsedHAR } from '@/models/app-data'

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
