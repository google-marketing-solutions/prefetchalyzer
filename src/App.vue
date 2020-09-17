<template>
  <main id="app">
    <FileUpload v-show="!state.hasData" @updateParsedHAR="updateParsedHAR" />
    <PageSettings v-show="state.hasData" :pages="pages" @setTitle="updatePageTitle" />
    <PrefetchTable v-show="state.hasData" :pages="pages" :resources="requests" />
  </main>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Page } from './models/page'
import { Resource } from './models/resource'
import { AppState, ParsedHAR } from './models/app-data'
import FileUpload from './components/file-upload.vue'
import PageSettings from './components/page-settings.vue'
import PrefetchTable from './components/prefetch-table.vue'

@Component({
  components: {
    FileUpload,
    PageSettings,
    PrefetchTable
  }
})
export default class App extends Vue {
  private state: AppState = {
    hasData: false // TODO: set to false after debugging/development
  }

  private pages: Page[] = [
    {
      id: 'page_1',
      label: 'page_1',
      url: 'https://example.com',
      transferSize: 1293422
    },
    {
      id: 'page_2',
      label: 'page_2',
      url: 'https://example.com/product.html',
      transferSize: 829328
    },
    {
      id: 'page_3',
      label: 'page_3',
      url: 'https://example.com/cart.html',
      transferSize: 2464427
    },
    {
      id: 'page_4',
      label: 'page_4',
      url: 'https://example.com/checkout.html',
      transferSize: 1650493
    }
  ]

  private requests: Resource[] = [
    {
      url: 'https://example.com/assets/app.js',
      cacheControl: 'no-cache, no-store, must-revalidate',
      transferSize: 387304,
      pages: ['page_2', 'page_3'],
      selectedPrefetch: true,
      prefetchOn: null
    },
    {
      url: 'https://example.com/assets/font.woff2',
      cacheControl: 'max-age=3600',
      transferSize: 247304,
      pages: ['page_2', 'page_4'],
      selectedPrefetch: true,
      prefetchOn: null
    },
    {
      url: 'https://example.com/assets/home.js',
      cacheControl: 'public, max-age=86400',
      transferSize: 34192,
      pages: ['page_1', 'page_2'],
      selectedPrefetch: true,
      prefetchOn: null
    },
    {
      url: 'https://example.com/assets/checkout.js',
      cacheControl: 'max-age=1678400',
      transferSize: 194736,
      pages: ['page_4'],
      selectedPrefetch: true,
      prefetchOn: null
    },
    {
      url: 'https://example.com/assets/app.css',
      cacheControl: 'max-age=1678400',
      transferSize: 430219,
      pages: ['page_3', 'page_4'],
      selectedPrefetch: true,
      prefetchOn: null
    }
  ]

  updateParsedHAR(parsedHAR: ParsedHAR): void {
    this.pages = parsedHAR.pages
    this.requests = parsedHAR.resources
    this.state.hasData = true
  }

  updatePageTitle(updatedPage: Page): void {
    const pageIndex = this.pages.findIndex(page => page.id === updatedPage.id)
    if (pageIndex !== -1) {
      this.pages[pageIndex].label = updatedPage.label
    }
  }
}
</script>

<style lang="scss">
@use "@material/theme/mdc-theme";
@use "@material/typography/mdc-typography";

// TODO: add link to Google Fonts for Roboto

body {
  margin: 2em auto;
  padding: 0 2em;
  font-family: Roboto;
  background: #f8f9fa;
}

hr {
  margin: 2rem 0;
  color: rgba(0, 0, 0, 0.87); // TODO: replace by mdc variable
}
</style>
