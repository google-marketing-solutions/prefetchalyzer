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

import { PagesByPageId, ResourcesByPage } from '@/models/app-data'
import { ResourceTypeLinkMapping } from '@/models/resource'

/**
 * Generates valid HTML prefetch statements (<link rel="prefetch">) for the provided resources, grouped by pages.
 *
 * @param pages Page information object with PageId key, used to display additional information in the output
 * @param resources List of selected resources for which the prefetch HTML shall be generated
 */
export function generatePrefetchHTML(pages: PagesByPageId, resources: ResourcesByPage): string {
  let html = ''

  for (const [pageId, assets] of Object.entries(resources)) {
    if (assets.length) {
      html += `${pages[pageId].label} (${pages[pageId].url}):
----------------------
`
      let asAttribute = ''
      assets.forEach((asset) => {
        asAttribute = asset.resourceType in ResourceTypeLinkMapping ? ` as="${ResourceTypeLinkMapping[asset.resourceType]}"` : ''
        html += `<link rel="prefetch" href="${asset.url}"${asAttribute}>
`
      })
      html += `

`
    }
  }
  return html
}

/**
 * Generates two WebPageTest (WPT) scripts that allow a performance comparison of a user journey
 * with and without prefetching the selected resources during navigation.
 *
 * @param pages Page information object with PageId key, used to generate navigation events in the WPT script
 * @param resources List of selected resources for which the prefetch HTML shall be injected before navigation in the WPT script
 */
export function generateWPTScript(pages: PagesByPageId, resources: ResourcesByPage): string {
  let html = `// NO PREFETCHING
// ----------------------
// Script start
`
  Object.values(pages).forEach(
    (page) => (html += `setEventName\t${page.label}
navigate\t${page.url}

`)
  )
  html += `// Script end

// WITH PREFETCHING
// ----------------------
// Script start
`
  for (const [pageId, assets] of Object.entries(resources)) {
    html += `setEventName\t${pages[pageId].label}
navigate\t${pages[pageId].url}

`
    if (assets.length) {
      html += 'exec\tvar entries=['
      let asAttribute = ''
      assets.forEach((asset) => {
        asAttribute = asset.resourceType in ResourceTypeLinkMapping ? `,as:"${ResourceTypeLinkMapping[asset.resourceType]}"` : ''
        html += `{rel:"prefetch",href:"${asset.url}"${asAttribute}}`
      })
      html += `];
execAndWait\tentries.map(function(entry) { var link = document.createElement("link"); const hint = Object.assign(link, entry); document.head.append(hint); return;});

`
    }
  }
  html += '// Script end'
  return html
}
