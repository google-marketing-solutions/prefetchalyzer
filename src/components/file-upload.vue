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
  <div class="file-upload-container" ref="fileDropArea">
    <div class="file-upload-container__inner">
      <h1 class="mdc-typography--headline4"><span class="logo--emphasized">Prefetch</span>alyzer</h1>
      <p class="mdc-typography--body1">Record a user session in HAR format, and upload it here to identify prefetching opportunities.</p>

      <label for="file-input" class="mdc-button mdc-button--raised file-input">
        Select HAR file
        <input id="file-input" type="file" @change="processFileSelection" accept=".har" />
      </label>
      <p class="mdc-typography--body1" v-show="state.uploadProgress !== null">Loading file ... {{ state.uploadProgress }}%</p>

      <p>
        <button v-show="!state.showTextInput" @click="state.showTextInput = true" class="mdc-button">
          <span class="mdc-button__label">Input JSON as text</span>
        </button>
      </p>

      <div v-show="state.showTextInput">
        <hr />
        <label class="mdc-text-field mdc-text-field--outlined mdc-text-field--textarea mdc-text-field--no-label">
          <span class="mdc-text-field__resizer">
            <textarea
              v-model.lazy="harTextInput"
              class="mdc-text-field__input"
              rows="4"
              cols="40"
              aria-label="Label"
              placeholder="Insert HAR JSON here ..."
            ></textarea>
          </span>
          <span class="mdc-notched-outline">
            <span class="mdc-notched-outline__leading"></span>
            <span class="mdc-notched-outline__trailing"></span>
          </span>
        </label>
        <br />
        <p>
          <button class="mdc-button mdc-button--raised" @click="processTextInput()">
            <span class="mdc-button__label">Parse text input</span>
          </button>
        </p>
      </div>

      <div class="mdc-snackbar file-upload-snackbar" ref="snackbar">
        <div class="mdc-snackbar__surface">
          <div class="mdc-snackbar__label" role="status" aria-live="polite" ref="snackbarMessage"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Ref } from 'vue-property-decorator'
import { parseHARFile } from '@/utils/har-utils'
import { MDCSnackbar } from '@material/snackbar'

@Component
export default class FileUpload extends Vue {
  @Ref() fileDropArea!: HTMLElement
  @Ref() snackbar!: HTMLElement
  @Ref() snackbarMessage!: HTMLElement

  private state: { uploadProgress: number | null; showTextInput: boolean } = {
    // holds current progress of file upload or 'null' when finished
    uploadProgress: null,
    showTextInput: false
  }

  // holds HAR input from textarea
  private harTextInput = ''
  // holds file contents from HAR file upload
  private harFile = ''

  // Material component reference
  private snackbarMDC: MDCSnackbar | null = null
  private snackbarTimeout: number | null = null

  processTextInput(): void {
    if (!this.harTextInput.length) {
      return
    }

    this.$emit('updateParsedHAR', parseHARFile(this.harTextInput))
  }

  processFileSelection(): void {
    if (!event || event === null) return
    const file: File | null = (event as any)?.target?.files[0]

    if (file) {
      this.processFile(file)
    }
  }

  processDrop(e: DragEvent): void {
    if (e.dataTransfer) {
      const files = e.dataTransfer.files
      if (files.length !== 1) {
        this.showSnackbar('Please select exactly one HAR file.')
        return
      }
      if (files[0].name.slice(-3).toLowerCase() !== 'har') {
        this.showSnackbar('The selected file is not a HAR file.')
        return
      }

      this.processFile(files[0])
    }
  }

  processFile(file: File): void {
    // TODO: add type check
    /* if (file.type && file.type.indexOf('json') === -1) {
         console.log('File is not a JSON file.', file.type, file)
         return
       } */

    const reader = new FileReader()
    reader.addEventListener('load', (event) => {
      this.state.uploadProgress = null
      // TODO: could also be ArrayBuffer type. Add type check
      this.harFile = (event?.target?.result ? event.target.result : '') as string
      this.$emit('updateParsedHAR', parseHARFile(this.harFile))
    })
    reader.addEventListener('progress', (event) => {
      if (event.loaded && event.total) {
        const percent = (event.loaded / event.total) * 100
        this.state.uploadProgress = percent
      }
    })
    reader.readAsText(file)
  }

  preventDragDefaults(e: Event): void {
    e.preventDefault()
    e.stopPropagation()
  }

  highlightDrag(): void {
    if (this.fileDropArea) {
      this.fileDropArea.classList.add('file-upload-container--dragging')
    }
  }

  unhighlightDrag(): void {
    if (this.fileDropArea) {
      this.fileDropArea.classList.remove('file-upload-container--dragging')
    }
  }

  showSnackbar(message: string): void {
    if (this.snackbarMessage) {
      // TODO: vue data binding breaks here after the first value change,
      //       needs review for a cleaner solution – best with a global
      //       message component?
      this.snackbarMessage.innerText = message
    }
    this.snackbarTimeout && clearTimeout(this.snackbarTimeout)
    this.snackbarMDC && this.snackbarMDC.open()
    this.snackbarTimeout = setTimeout(() => this.snackbarMDC && this.snackbarMDC.close(), 5000)
  }

  mounted() {
    // TODO: check for correct lifecycle hook
    if (this.snackbar) {
      this.snackbarMDC = new MDCSnackbar(this.snackbar)
    }

    if (this.fileDropArea) {
      ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
        this.fileDropArea.addEventListener(eventName, this.preventDragDefaults, false)
      })
      ;['dragenter', 'dragover'].forEach((eventName) => {
        this.fileDropArea.addEventListener(eventName, this.highlightDrag, false)
      })
      ;['dragleave', 'drop'].forEach((eventName) => {
        this.fileDropArea.addEventListener(eventName, this.unhighlightDrag, false)
      })
      this.fileDropArea.addEventListener('drop', this.processDrop, false)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@use "@material/button/mdc-button";
@use "@material/textfield/mdc-text-field";
@use "@material/snackbar/mdc-snackbar";

.file-upload-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  border: 2px dashed transparent;
  transition: background-color 0.1s ease-out, border-color 0.2s ease-out;

  &__inner {
    max-width: 40rem;
    text-align: center;
  }

  &--dragging {
    border-color: var(--mdc-theme-primary);
    background-color: rgba(#673ab7, 0.12); // $primary-light TODO: fix style imports
  }
}

.file-input {
  input {
    display: none;
  }
}

.file-input {
  input {
    display: none;
  }
}
</style>
