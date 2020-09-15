<template>
  <div>
    <h2 class="mdc-typography--headline4">Prefetching Opportunities</h2>
    <label class="selectionCheckboxLabel">
      <input type="checkbox" v-model.lazy="filters.collapseUnselected" />
      Hide unselected requests
    </label>
    <br />
    <div class="mdc-data-table">
      <div class="mdc-data-table__table-container">
        <table class="mdc-data-table__table" aria-label="Prefetching Analysis">
          <thead>
            <tr class="mdc-data-table__header-row">
              <th
                class="mdc-data-table__header-cell mdc-data-table__header-cell--checkbox"
                role="columnheader"
                scope="col"
              ></th>
              <th class="mdc-data-table__header-cell" role="columnheader" scope="col">File</th>
              <th class="mdc-data-table__header-cell" role="columnheader" scope="col">Cache</th>
              <th
                class="mdc-data-table__header-cell mdc-data-table__header-cell--numeric"
                role="columnheader"
                scope="col"
              >Size</th>
              <th
                class="mdc-data-table__header-cell mdc-data-table__header-cell--numeric pagecolumn"
                role="columnheader"
                scope="col"
                v-for="page in pages"
                :key="page.id"
              >{{ page.label }}</th>
            </tr>
          </thead>
          <tbody class="mdc-data-table__content">
            <tr
              v-for="asset in prefetchList"
              :key="asset.url"
              :class="{ disabledRow: !asset.selectedPrefetch}"
              v-show="!filters.collapseUnselected || asset.selectedPrefetch"
              class="mdc-data-table__row"
            >
              <td class="mdc-data-table__cell mdc-data-table__cell--checkbox">
                <div class="mdc-checkbox mdc-data-table__row-checkbox">
                  <input
                    type="checkbox"
                    class="mdc-checkbox__native-control"
                    aria-labelledby="u0"
                    v-model.lazy="asset.selectedPrefetch"
                  />
                  <div class="mdc-checkbox__background">
                    <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24">
                      <path
                        class="mdc-checkbox__checkmark-path"
                        fill="none"
                        d="M1.73,12.91 8.1,19.28 22.79,4.59"
                      />
                    </svg>
                    <div class="mdc-checkbox__mixedmark"></div>
                  </div>
                  <div class="mdc-checkbox__ripple"></div>
                </div>
              </td>
              <th class="mdc-data-table__cell" scope="row">{{ asset.url }}</th>
              <td class="mdc-data-table__cell">{{ asset.cacheControl }}</td>
              <td
                class="mdc-data-table__cell mdc-data-table__cell--numeric"
              >{{ formatSize(asset.transferSize) }}</td>
              <td
                class="mdc-data-table__cell mdc-data-table__cell--numeric"
                v-for="page in pages"
                :key="page.id"
                v-html="prefetchTask(page, asset)"
              ></td>
            </tr>
            <tr class="noBackground">
              <td colspan="99">
                <hr />
              </td>
            </tr>
            <!-- TOTALS -->
            <tr class="noBackground">
              <td class="mdc-data-table__cell" colspan="3">{{ totalAssets }} assets</td>
              <td class="mdc-data-table__cell mdc-data-table__cell--numeric">{{ totalSize }}</td>
              <td class="mdc-data-table__cell" colspan="99">
                <strong>Savings per page</strong>
              </td>
            </tr>
            <tr class="noBackground">
              <td colspan="4"></td>
              <th
                class="mdc-data-table__cell mdc-data-table__cell--numeric"
                v-for="(page, index) in pages"
                :key="page.id"
              >
                <span
                  v-if="index > 0"
                  v-html="formatPercentage(totalPrefetchSavingsPercentage(page.id))"
                ></span>
                <br v-if="index > 0" />
                <span v-else>—</span>
                {{ index > 0 ? formatSize(totalPrefetchSavings(page.id)) : '' }}
              </th>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <h3>Export</h3>
    <button @click="generatePrefetchHTML()">Generate Prefetch HTML</button>
    <button @click="generateWPTScript()">Generate WebPageTest script</button>
    <textarea rows="10" cols="80" v-model="generated.prefetchExport"></textarea>
  </div>
</template>

<script lang="ts">
import { Page, PageId } from '@/models/page'
import { Resource } from '@/models/resource'
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class PrefetchTable extends Vue {
  @Prop() private pages!: Page[];
  @Prop() private resources!: Resource[];

  private filters = {
    // whether un-selected rows should be hidden from the UI (default: shown, but grayed-out)
    collapseUnselected: false
  }

  private generated = {
    // holds generated output as requested, e.g.
    // WPT script or prefetch HTML output
    prefetchExport: ''
  }

  get prefetchList(): Resource[] {
    const list = this.resources
      // filter out resources already requested on page 1 (prefetch obsolete as it has no effect)
      .filter((resource: Resource) => !resource.pages.includes(this.pages[0].id))
      // mark page for prefetching
      .map((resource) => {
        for (let i = 1; i < this.pages.length; i++) {
          if (resource.pages.includes(this.pages[i].id)) {
            resource.prefetchOn = this.pages[i - 1].id
            break
          }
        }
        return resource
      })
      // sort by size DESC
      .sort((a, b) => (a.transferSize < b.transferSize ? 1 : a.transferSize > b.transferSize ? -1 : 0))
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
    return this.formatSize(this.selectedPrefetchList.reduce((sum: number, current: Resource) => (sum += current.transferSize), 0))
  }

  // METHODS

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
      return '✅'
    } else if (asset.pages.includes(page.id)) {
      return this.formatPercentage(Math.ceil((asset.transferSize / page.transferSize) * 1000) / 10)
    }
    return '—'
  }

  // get total saved transfer size for a given page (via PageId)
  totalPrefetchSavings(pageId: PageId): number {
    return this.prefetchList
      .filter((resource) => resource.selectedPrefetch && resource.pages.includes(pageId))
      .reduce((sum, current) => (sum += current.transferSize), 0)
  }

  // get total savings for prefetching selected resources in percent
  totalPrefetchSavingsPercentage(pageId: PageId) {
    return Math.round((this.totalPrefetchSavings(pageId) / this.pagesObject[pageId].transferSize) * 1000) / 10
  }

  formatPercentage(percentValue: number): string {
    // TODO: remove Number() typecasts in favor of data verification from HAR import (in HAR parsing method)
    return `<span class="percentValue" style="opacity: ${Number(percentValue) / 100 + 0.5}">${Number(percentValue)}%</span>`
  }

  generatePrefetchHTML() {
    let html = ''

    for (const [pageId, assets] of Object.entries(this.selectedPrefetchAssetsByPage)) {
      if (assets.length) {
        html += `${this.pagesObject[pageId].label} (${this.pagesObject[pageId].url}):
----------------------
`
        assets.forEach((asset) => {
          // TODO: even better with type, e.g. as=document – required for it to work correctly in some browsers
          html += `<link rel="prefetch" href="${asset.url}">
`
        })
        html += `

`
      }
    }
    this.generated.prefetchExport = html
  }

  generateWPTScript() {
    let html = `NO PREFETCHING
----------------------
`
    this.pages.forEach(
      (page) =>
        (html += `setEventName\t${page.label}
navigate\t${page.url}

`)
    )
    html += `

WITH PREFETCHING
----------------------
`
    for (const [pageId, assets] of Object.entries(this.selectedPrefetchAssetsByPage)) {
      html += `setEventName\t${this.pagesObject[pageId].label}
navigate\t${this.pagesObject[pageId].url}

`
      if (assets.length) {
        html += 'exec\tvar entries=['
        // TODO: add as=type to prefetch statements
        assets.forEach((asset) => (html += `{rel:"prefetch",href:"${asset.url}"}`))
        html += `];
execAndWait\tentries.map(function(entry) { var link = document.createElement("link"); const hint = Object.assign(link, entry); document.head.append(hint); return;});

`
      }
    }
    this.generated.prefetchExport = html
  }
}
</script>

<style lang="scss">
@use "~@material/data-table/mdc-data-table";
@use "~@material/checkbox/mdc-checkbox";

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

.pageColumn {
  min-width: 4rem;
}

.noBackground {
  background-color: transparent !important;
}
</style>
