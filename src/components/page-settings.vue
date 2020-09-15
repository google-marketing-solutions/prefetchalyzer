<template>
  <div>
    <h2>Pages</h2>
    <ul>
      <li v-for="page in pages" :key="page.id">
        <input type="text" v-model.lazy="page.label" />
        <a :href="page.url">{{ page.url }}</a>
      </li>
    </ul>
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
<style scoped lang="scss"></style>
