<template>
  <div class="file-upload-container">
    <div class="file-upload-container__inner">
      <h1 class="mdc-typography--headline4">
        <span class="logo--emphasized">Prefetch</span>alyzer
      </h1>
      <p
        class="mdc-typography--body1"
      >Record a user session in HAR format, and upload it here to identify prefetching opportunities.</p>

      <input class="mdc-button mdc-button--raised" type="file" @change="processFile" accept=".har" />
      <p
        class="mdc-typography--body1"
        v-show="state.uploadProgress !== null"
      >Loading file ... {{ state.uploadProgress }}%</p>

      <p>
        <button
          v-show="!state.showTextInput"
          @click="state.showTextInput = true"
          class="mdc-button"
        >
          <span class="mdc-button__label">Input JSON as text</span>
        </button>
      </p>

      <div v-show="state.showTextInput">
        <hr />
        <label
          class="mdc-text-field mdc-text-field--outlined mdc-text-field--textarea mdc-text-field--no-label"
        >
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
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { parseHARFile } from '@/utils/har-utils'

@Component
export default class FileUpload extends Vue {
  private state: { uploadProgress: number | null; showTextInput: boolean } = {
    // holds current progress of file upload or 'null' when finished
    uploadProgress: null,
    showTextInput: false
  }

  // holds HAR input from textarea
  private harTextInput = ''
  // holds file contents from HAR file upload
  private harFile = ''

  processTextInput() {
    if (!this.harTextInput.length) {
      return
    }

    this.$emit('updateParsedHAR', parseHARFile(this.harTextInput))
  }

  processFile(): void {
    if (!event || event === null) return
    const file: File = (event as any)?.target?.files[0]

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
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@use "@material/button/mdc-button";
@use "@material/textfield/mdc-text-field";

.file-upload-container {
  display: flex;
  justify-content: center;
  align-items: center;

  &__inner {
    max-width: 40rem;
    text-align: center;
  }
}

.logo--emphasized {
  color: var(--mdc-theme-primary);
}
</style>
