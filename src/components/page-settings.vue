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
    <h2 class="mdc-typography--headline6">Pages in visited order</h2>
    <p class="mdc-typography--body2">Edit the page labels here to update the titles in analysis view.</p>
    <ol class="page-list">
      <li v-for="page in pages" :key="page.id">
        <label class="mdc-text-field mdc-text-field--filled mdc-text-field--label-floating">
          <span class="mdc-text-field__ripple"></span>
          <span class="mdc-floating-label mdc-floating-label--float-above" :id="'page-label-' + page.id">Page label</span>
          <input class="mdc-text-field__input" type="text" :aria-labelledby="'page-label-' + page.id" v-model.lazy="page.label" />
          <span class="mdc-line-ripple"></span>
        </label>
        <br />
        <a class="page-url mdc-typography--body2" :href="page.url">{{ page.url }}</a>
      </li>
    </ol>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Page } from '@/models/page'

@Component
export default class FileUpload extends Vue {
  @Prop() private pages!: Page[]

  setTitle(page: Page) {
    this.$emit('setTitle', page)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.page-list {
  li:not(:first-child) {
    margin-top: 1em;
  }
}

.page-url {
  overflow-wrap: break-word;
  word-wrap: break-word;
}
</style>
