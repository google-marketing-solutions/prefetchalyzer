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
  <div class="mdc-dialog" ref="dialog" @MDCDialog:closed="setOpenState(false)">
    <div class="mdc-dialog__container">
      <div class="mdc-dialog__surface" role="alertdialog" aria-modal="true" aria-labelledby="data-export" aria-describedby="data-export-dialog-content">
        <div class="mdc-dialog__content" id="data-export-dialog-content">
          <button class="mdc-button" @click="showHTML()">
            <span class="mdc-button__label">HTML Prefetch</span>
          </button>
          <button class="mdc-button" @click="showWPT()">
            <span class="mdc-button__label">WebPageTest Script</span>
          </button>

          <label class="mdc-text-field mdc-text-field--outlined mdc-text-field--textarea mdc-text-field--no-label prefetch-export-output">
            <span class="mdc-text-field__resizer">
              <textarea
                v-model="output"
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
</template>

<script lang="ts">
import { PagesByPageId, ResourcesByPage } from '@/models/app-data'
import { ResourceTypeLinkMapping } from '@/models/resource'
import { MDCDialog } from '@material/dialog'
import { Component, Prop, Ref, Vue } from 'vue-property-decorator'

@Component<DataExport>({
  watch: {
    open(setOpen: boolean) {
      this.setOpenState(setOpen)
    }
  }
})
export default class DataExport extends Vue {
  @Prop() private open!: boolean
  @Prop() private pages!: PagesByPageId
  @Prop() private resources!: ResourcesByPage
  @Ref() dialog!: HTMLElement

  private output = ''

  // Material component reference
  private dialogMDC: MDCDialog | null = null

  mounted() {
    if (this.dialog) {
      this.dialogMDC = new MDCDialog(this.dialog)
    }
  }

  get prefetchHTML(): string {
    return this.generatePrefetchHTML()
  }

  get wptScript(): string {
    return this.generateWPTScript()
  }

  setOpenState(setOpen: boolean) {
    if (this.dialogMDC) {
      if (setOpen && !this.dialogMDC.isOpen) {
        this.dialogMDC.open()
      } else if (!setOpen && this.dialogMDC.isOpen) {
        this.dialogMDC.close()
      }
    }
    if (this.open !== setOpen) {
      this.$emit('update:open', setOpen)
    }
  }

  showHTML() {
    this.output = this.prefetchHTML
  }

  showWPT() {
    this.output = this.wptScript
  }

  generatePrefetchHTML(): string {
    let html = ''

    for (const [pageId, assets] of Object.entries(this.resources)) {
      if (assets.length) {
        html += `${this.pages[pageId].label} (${this.pages[pageId].url}):
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

  generateWPTScript(): string {
    let html = `// NO PREFETCHING
// ----------------------
// Script start
`
    Object.values(this.pages).forEach(
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
    for (const [pageId, assets] of Object.entries(this.resources)) {
      html += `setEventName\t${this.pages[pageId].label}
navigate\t${this.pages[pageId].url}

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
}
</script>

<style scoped lang="scss">
.mdc-dialog .mdc-dialog__surface {
  @media (min-width: 592px) {
    width: 80vw;
    max-width: 960px;
  }
}

.prefetch-export-output textarea {
  font-family: 'Roboto Mono', 'Consolas', 'Courier New', Courier, monospace;
}
</style>
