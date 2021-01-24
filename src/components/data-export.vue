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
import { generatePrefetchHTML, generateWPTScript } from '@/utils/export-utils'
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
    return generatePrefetchHTML(this.pages, this.resources)
  }

  get wptScript(): string {
    return generateWPTScript(this.pages, this.resources)
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
