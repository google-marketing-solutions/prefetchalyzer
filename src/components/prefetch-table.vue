<!--
 Copyright 2020 Google LLC
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-->

<template>
  <div>
    <div class="table-title">
      <h2 class="mdc-typography--headline5">Prefetching Opportunities</h2>
      <div class="table-title__actions">
        <button class="mdc-button" @click="openPageSettings()">
          <svg class="mdc-button__icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path
              d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z"
            />
          </svg>
          <span class="mdc-button__label">View pages</span>
        </button>

        <div id="export-menu" class="mdc-menu-surface--anchor">
          <button class="mdc-button" @click="openExportMenu()">
            <svg class="mdc-button__icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path d="M0 0h24v24H0z" fill="none" />
              <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z" />
            </svg>
            <span class="mdc-button__label">Export</span>
          </button>

          <div class="mdc-menu mdc-menu-surface" ref="exportMenu">
            <ul class="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical" tabindex="-1">
              <li class="mdc-list-item" role="menuitem" @click="generatePrefetchHTML()">
                <span class="mdc-list-item__ripple"></span>
                <span class="mdc-list-item__text">Generate prefetch HTML</span>
              </li>
              <li class="mdc-list-item" role="menuitem" @click="generateWPTScript()">
                <span class="mdc-list-item__ripple"></span>
                <span class="mdc-list-item__text">Generate WebPageTest script</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="filter-controls">
      <label class="filter-controls__label">
        <div class="mdc-checkbox mdc-data-table__row-checkbox">
          <input type="checkbox" class="mdc-checkbox__native-control" aria-labelledby="u0" v-model.lazy="filters.collapseUnselected" />
          <div class="mdc-checkbox__background">
            <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24">
              <path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59" />
            </svg>
            <div class="mdc-checkbox__mixedmark"></div>
          </div>
          <div class="mdc-checkbox__ripple"></div>
        </div>
        Hide unselected requests
      </label>
      <label class="filter-controls__label">
        <div class="mdc-checkbox mdc-data-table__row-checkbox">
          <input type="checkbox" class="mdc-checkbox__native-control" aria-labelledby="u0" v-model.lazy="filters.shortenURLs" />
          <div class="mdc-checkbox__background">
            <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24">
              <path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59" />
            </svg>
            <div class="mdc-checkbox__mixedmark"></div>
          </div>
          <div class="mdc-checkbox__ripple"></div>
        </div>
        Shorten URLs
      </label>
      <ChipMultiSelect v-model="filters.resourceTypes" />
    </div>
    <div class="mdc-data-table prefetch-table">
      <div class="mdc-data-table__table-container prefetch-table__container">
        <table class="mdc-data-table__table" aria-label="Prefetching Analysis">
          <thead>
            <tr class="mdc-data-table__header-row">
              <th class="mdc-data-table__header-cell mdc-data-table__header-cell--checkbox" role="columnheader" scope="col"></th>
              <th class="mdc-data-table__header-cell" role="columnheader" scope="col">File</th>
              <th class="mdc-data-table__header-cell" role="columnheader" scope="col">Cache Control</th>
              <th class="mdc-data-table__header-cell mdc-data-table__header-cell--numeric" role="columnheader" scope="col">Size</th>
              <th
                class="mdc-data-table__header-cell mdc-data-table__header-cell--numeric pagecolumn bg-lightgrey"
                role="columnheader"
                scope="col"
                v-for="page in pages"
                :key="page.id"
              >
                {{ page.label }}
              </th>
            </tr>
          </thead>
          <tbody class="mdc-data-table__content">
            <tr
              v-for="asset in prefetchList"
              :key="asset.url"
              :class="{ disabledRow: !asset.selectedPrefetch }"
              v-show="!filters.collapseUnselected || asset.selectedPrefetch"
              class="mdc-data-table__row"
            >
              <td class="mdc-data-table__cell mdc-data-table__cell--checkbox">
                <div class="mdc-checkbox mdc-data-table__row-checkbox">
                  <input type="checkbox" class="mdc-checkbox__native-control" aria-labelledby="u0" v-model.lazy="asset.selectedPrefetch" />
                  <div class="mdc-checkbox__background">
                    <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24">
                      <path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59" />
                    </svg>
                    <div class="mdc-checkbox__mixedmark"></div>
                  </div>
                  <div class="mdc-checkbox__ripple"></div>
                </div>
              </td>
              <th class="mdc-data-table__cell" scope="row" :title="asset.url">{{ getDisplayedURL(asset.url) }}</th>
              <td class="mdc-data-table__cell">{{ asset.cacheControl ? asset.cacheControl : 'n/a' }}</td>
              <td class="mdc-data-table__cell mdc-data-table__cell--numeric">{{ formatSize(asset.size) }}</td>
              <td
                class="mdc-data-table__cell mdc-data-table__cell--numeric bg-lightgrey"
                v-for="page in pages"
                :key="page.id"
                v-html="prefetchTask(page, asset)"
              ></td>
            </tr>
            <!-- TOTALS -->
            <tr class="totals-row">
              <td class="mdc-data-table__cell" colspan="3">{{ totalAssets }} resources</td>
              <td class="mdc-data-table__cell mdc-data-table__cell--numeric">{{ totalSize }}</td>
              <td class="mdc-data-table__cell" colspan="99">
                <strong>Savings per page</strong>
              </td>
            </tr>
            <tr>
              <td colspan="4"></td>
              <th class="mdc-data-table__cell mdc-data-table__cell--numeric" v-for="(page, index) in pages" :key="page.id">
                <span v-if="index > 0" v-html="formatPercentage(totalPrefetchSavingsPercentage(page.id))"></span>
                <br v-if="index > 0" />
                <span v-else>—</span>
                {{ index > 0 ? formatSize(totalPrefetchSavings(page.id)) : '' }}
              </th>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="mdc-dialog" ref="dialog">
      <div class="mdc-dialog__container">
        <div class="mdc-dialog__surface" role="alertdialog" aria-modal="true" aria-labelledby="data-export" aria-describedby="data-export-dialog-content">
          <div class="mdc-dialog__content" id="data-export-dialog-content">
            <label class="mdc-text-field mdc-text-field--outlined mdc-text-field--textarea mdc-text-field--no-label prefetch-export-output">
              <span class="mdc-text-field__resizer">
                <textarea
                  v-model="generated.prefetchExport"
                  class="mdc-text-field__input"
                  rows="20"
                  cols="120"
                  aria-label="Label"
                  placeholder="Export output is generated here ..."
                ></textarea>
              </span>
              <span class="mdc-notched-outline">
                <span class="mdc-notched-outline__leading"></span>
                <span class="mdc-notched-outline__trailing"></span>
              </span>
            </label>
          </div>
          <div class="mdc-dialog__actions">
            <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="close">
              <div class="mdc-button__ripple"></div>
              <span class="mdc-button__label">Close</span>
            </button>
          </div>
        </div>
      </div>
      <div class="mdc-dialog__scrim"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Page, PageId } from '@/models/page'
import { PrefetchTableFilters } from '@/models/app-data'
import { Resource, ResourceTypeLinkMapping, ResourceURL } from '@/models/resource'
import { Component, Prop, Vue, Ref } from 'vue-property-decorator'
import { MDCDialog } from '@material/dialog'
import { MDCMenu } from '@material/menu'
import ChipMultiSelect from './chip-multi-select.vue'

@Component({
  components: {
    ChipMultiSelect
  }
})
export default class PrefetchTable extends Vue {
  @Prop() private pages!: Page[]
  @Prop() private resources!: Resource[]
  @Ref() dialog!: HTMLElement
  @Ref() exportMenu!: HTMLElement

  // Material component reference
  private dialogMDC: MDCDialog | null = null
  private exportMenuMDC: MDCMenu | null = null

  private filters: PrefetchTableFilters = {
    // whether un-selected rows should be hidden from the UI (default: shown, but grayed-out)
    collapseUnselected: false,
    // whether URLs shall be displayed shortened (example.com/.../file.js) in the table (default: shorten)
    shortenURLs: true,
    resourceTypes: {
      script: true,
      stylesheet: true,
      document: true,
      font: true
    }
  }

  private generated = {
    // holds generated output as requested, e.g.
    // WPT script or prefetch HTML output
    prefetchExport: ''
  }

  get prefetchList(): Resource[] {
    const list = this.resources
      .filter((resource: Resource) => this.filters.resourceTypes[resource.resourceType])
      // filter out resources already requested on page 1 (prefetch obsolete as it has no effect)
      .filter((resource: Resource) => !resource.pages.has(this.pages[0].id))
      // mark page for prefetching
      .map((resource) => {
        for (let i = 1; i < this.pages.length; i++) {
          if (resource.pages.has(this.pages[i].id)) {
            resource.prefetchOn = this.pages[i - 1].id
            break
          }
        }
        return resource
      })
      // sort by size DESC
      .sort((a, b) => (a.size < b.size ? 1 : a.size > b.size ? -1 : 0))
      // sort by prefetching path ASC
      .sort((a, b) => {
        // TODO: quickfix to get it working for now with TS nullable type check
        if (!a.prefetchOn || !b.prefetchOn) return 0
        // TODO: sorting on ID is fragile, better use Page.order property
        return a.prefetchOn > b.prefetchOn ? 1 : a.prefetchOn < b.prefetchOn ? -1 : 0
      })
    return list
  }

  get selectedPrefetchList(): Resource[] {
    return this.prefetchList.filter((asset) => asset.selectedPrefetch)
  }

  get pagesObject(): Record<PageId, Page> {
    const pagesObject: Record<PageId, Page> = {}
    this.pages.forEach((page) => (pagesObject[page.id] = page))
    return pagesObject
  }

  get selectedPrefetchAssetsByPage(): Record<PageId, Resource[]> {
    const assetsByPage: Record<PageId, Resource[]> = {}
    this.pages.forEach((page) => (assetsByPage[page.id] = []))
    this.selectedPrefetchList.forEach((asset) => {
      if (asset.prefetchOn) {
        assetsByPage[asset.prefetchOn].push(asset)
      }
    })
    return assetsByPage
  }

  get totalAssets(): number {
    return this.selectedPrefetchList.length
  }

  get totalSize(): string {
    return this.formatSize(this.selectedPrefetchList.reduce((sum: number, current: Resource) => (sum += current.size), 0))
  }

  // METHODS

  mounted() {
    if (this.dialog) {
      this.dialogMDC = new MDCDialog(this.dialog)
    }
    if (this.exportMenu) {
      this.exportMenuMDC = new MDCMenu(this.exportMenu)
    }
  }

  openPageSettings() {
    this.$emit('openPageSettings')
  }

  openExportMenu() {
    if (this.exportMenuMDC) {
      this.exportMenuMDC.open = true
    }
  }

  // readable file size
  formatSize(size: number): string {
    if (size > 1000000) {
      return `${Math.round((size / 1000000) * 10) / 10} MiB`
    } else if (size > 1000) {
      return `${Math.round(size / 1000)} KiB`
    }
    return `${size} B`
  }

  // render prefetch entry per page/asset
  prefetchTask(page: Page, asset: Resource): string {
    if (page.id === asset.prefetchOn) {
      return '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 10H6.83L9 7.83l1.41-1.41L9 5l-6 6 6 6 1.41-1.41L9 14.17 6.83 12H16c1.65 0 3 1.35 3 3v4h2v-4c0-2.76-2.24-5-5-5z"/></svg>'
    } else if (asset.pages.has(page.id)) {
      return this.formatPercentage(Math.ceil((asset.size / page.size) * 1000) / 10)
    }
    return '—'
  }

  // get total saved transfer size for a given page (via PageId)
  totalPrefetchSavings(pageId: PageId): number {
    return this.prefetchList
      .filter((resource) => resource.selectedPrefetch && resource.pages.has(pageId))
      .reduce((sum, current) => (sum += current.size), 0)
  }

  // get total savings for prefetching selected resources in percent
  totalPrefetchSavingsPercentage(pageId: PageId) {
    return Math.round((this.totalPrefetchSavings(pageId) / this.pagesObject[pageId].size) * 1000) / 10
  }

  formatPercentage(percentValue: number): string {
    return `<span class="percentValue" style="opacity: ${percentValue / 100 + 0.5}">${percentValue}%</span>`
  }

  getDisplayedURL(url: ResourceURL): string {
    // do not shorten short URLs
    if (!this.filters.shortenURLs || url.length < 65) {
      return url
    }
    const splittedProtocol = url.split('://')
    const splittedPath = splittedProtocol[1].split('/')

    // remove empty element at the end for URLs ending with '/'
    if (splittedPath[splittedPath.length - 1] === '') {
      splittedPath.splice(-1)
    }

    let shortenedURL = ''

    // do not shorten paths with one sub-directory
    if (splittedPath.length < 3) {
      shortenedURL = url
    }

    shortenedURL = `${splittedProtocol[0]}://${splittedPath[0]}/…/${splittedPath[splittedPath.length - 1]}`

    // final check for too long URLs
    if (shortenedURL.length > 100) {
      shortenedURL = shortenedURL.substr(0, 100) + '…'
    }

    return shortenedURL
  }

  generatePrefetchHTML() {
    this.generated.prefetchExport = ''
    let html = ''

    for (const [pageId, assets] of Object.entries(this.selectedPrefetchAssetsByPage)) {
      if (assets.length) {
        html += `${this.pagesObject[pageId].label} (${this.pagesObject[pageId].url}):
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
    this.generated.prefetchExport = html

    if (this.dialogMDC) {
      this.dialogMDC.open()
    }
  }

  generateWPTScript() {
    this.generated.prefetchExport = ''
    let html = `// NO PREFETCHING
// ----------------------
// Script start
`
    this.pages.forEach(
      (page) =>
        (html += `setEventName\t${page.label}
navigate\t${page.url}

`)
    )
    html += `// Script end

// WITH PREFETCHING
// ----------------------
// Script start
`
    for (const [pageId, assets] of Object.entries(this.selectedPrefetchAssetsByPage)) {
      html += `setEventName\t${this.pagesObject[pageId].label}
navigate\t${this.pagesObject[pageId].url}

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
    this.generated.prefetchExport = html

    if (this.dialogMDC) {
      this.dialogMDC.open()
    }
  }
}
</script>

<style lang="scss">
@use "~@material/data-table/mdc-data-table";
@use "~@material/checkbox/mdc-checkbox";
@use "~@material/menu/mdc-menu";
@use "~@material/menu-surface/mdc-menu-surface";
@use "~@material/list/mdc-list";

textarea {
  display: block;
  margin: 1em 0;
}

.disabledRow {
  opacity: 0.4;
}

.percentValue {
  color: #0a0;
  font-weight: 700;
}

.pagecolumn {
  min-width: 4rem;
}

.bg-lightgrey {
  background: rgba(0, 0, 0, 0.02);
}

.totals-row {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.table-title {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;

  &__actions {
    display: flex;
    flex-flow: row nowrap;

    & > *:not(:first-child) {
      margin-left: 1rem;
    }
  }
}

.filter-controls {
  display: flex;
  flex-flow: row wrap;

  &__label {
    display: inline-flex;
    flex-flow: row nowrap;
    align-items: center;
    cursor: pointer;

    & + & {
      margin-left: 1rem;
    }
  }
}

.prefetch-table {
  position: relative;
  max-width: calc(100vw - 4rem);

  &__container::after {
    content: ' ';
    position: absolute;
    top: 1px;
    right: 0;
    width: 1rem;
    height: calc(100% - 2px);
    background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.6) 60%, rgba(255, 255, 255, 0.8) 100%);
  }
}

.prefetch-export-output textarea {
  font-family: 'Roboto Mono', 'Consolas', 'Courier New', Courier, monospace;
}
</style>
