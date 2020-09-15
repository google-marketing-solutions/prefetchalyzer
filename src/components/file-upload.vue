<template>
  <div>
    <h1 class="mdc-typography--headline3"><span class="logo--emphasized">Prefetch</span>alyzer</h1>
    <p class="mdc-typography--body1">Record a user session in HAR format, and upload it here to identify prefetching opportunities.</p>
    <textarea v-model.lazy="harTextInput"></textarea>
    <button @click="processTextInput()">Parse text input</button>
    –OR– Select a file here:
    <input type="file" @change="processFile" accept=".har" />
    <span v-show="uploadProgress !== null">Loading file ... {{ uploadProgress }}%</span>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { parseHARFile } from '@/utils/har-utils'

@Component
export default class FileUpload extends Vue {
  // holds current progress of file upload or 'null' when finished
  private uploadProgress: number | null = null;
  // holds HAR input from textarea
  private harTextInput = '';
  // holds file contents from HAR file upload
  private harFile = '';

  processTextInput() {
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
      this.uploadProgress = null
      // TODO: could also be ArrayBuffer type. Add type check
      this.harFile = (event?.target?.result ? event.target.result : '') as string
      this.$emit('updateParsedHAR', parseHARFile(this.harFile))
    })
    reader.addEventListener('progress', (event) => {
      if (event.loaded && event.total) {
        const percent = (event.loaded / event.total) * 100
        this.uploadProgress = percent
      }
    })
    reader.readAsText(file)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.logo--emphasized {
  color: var(--mdc-theme-primary);
}
</style>
