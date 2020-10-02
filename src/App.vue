<template>
  <div id="app">
    <header>
      <a class="logo" @click="setActiveView('upload')">
        <img src="./assets/logo.svg" width="24" height="24" />
        Prefetchalyzer
      </a>
      <nav class="navigation mdc-tab-bar" role="tablist">
        <div class="mdc-tab-scroller">
          <div class="mdc-tab-scroller__scroll-area">
            <div class="mdc-tab-scroller__scroll-content">
              <button class="mdc-tab mdc-tab--active" role="tab" v-for="view in navigation" :key="view.key" @click="setActiveView(view.key)">
                <span class="mdc-tab__content">
                  <!--<span class="mdc-tab__icon material-icons" aria-hidden="true">favorite</span>-->
                  <span class="mdc-tab__text-label">{{ view.label }}</span>
                </span>
                <span class="mdc-tab-indicator" :class="{ 'mdc-tab-indicator--active': view.key === state.activeView }">
                  <span class="mdc-tab-indicator__content mdc-tab-indicator__content--underline"></span>
                </span>
                <span class="mdc-tab__ripple"></span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
    <main id="app">
      <FileUpload v-show="state.activeView === 'upload'" @updateParsedHAR="updateParsedHAR" />

      <div v-show="state.hasData && state.activeView === 'prefetch_opps'">
        <PrefetchTable :pages="pages" :resources="requests" />
        <PageSettings :pages="pages" @setTitle="updatePageTitle" />
      </div>

      <About v-show="state.activeView === 'about'" />
    </main>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Page } from './models/page'
import { Resource } from './models/resource'
import { AppState, AppTab, AppView, ParsedHAR } from './models/app-data'
import About from './components/about.vue'
import FileUpload from './components/file-upload.vue'
import PageSettings from './components/page-settings.vue'
import PrefetchTable from './components/prefetch-table.vue'

// Material components
import { MDCTabBar } from '@material/tab-bar'

@Component({
  components: {
    About,
    FileUpload,
    PageSettings,
    PrefetchTable
  }
})
export default class App extends Vue {
  private state: AppState = {
    hasData: false,
    activeView: 'upload'
  }

  private navigation: AppTab[] = [
    {
      key: 'upload',
      label: 'Upload Session',
      requiresData: false
    },
    {
      key: 'prefetch_opps',
      label: 'Prefetching Analysis',
      requiresData: true
    },
    {
      key: 'about',
      label: 'FAQ',
      requiresData: false
    }
  ]

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

  // Material component reference
  private navigationMDC: MDCTabBar | null = null

  setActiveView(view: AppView) {
    this.state.activeView = view
    // check for tabs in navigation to update state
    new Promise((resolve) => resolve()).then((result) => {
      const navIndex = this.navigation.findIndex(tab => tab.key === this.state.activeView)
      if (navIndex !== -1) {
        this.navigationMDC && this.navigationMDC.activateTab(navIndex)
      }
    })
  }

  updateParsedHAR(parsedHAR: ParsedHAR): void {
    this.pages = parsedHAR.pages
    this.requests = parsedHAR.resources
    this.state.hasData = true
    this.setActiveView('prefetch_opps')
  }

  updatePageTitle(updatedPage: Page): void {
    const pageIndex = this.pages.findIndex((page) => page.id === updatedPage.id)
    if (pageIndex !== -1) {
      this.pages[pageIndex].label = updatedPage.label
    }
  }

  mounted() {
    // Material components initialization
    // TODO: check for correct lifecycle hook
    const navigation = document.querySelector('.navigation')
    if (navigation) {
      this.navigationMDC = new MDCTabBar(navigation)
    }
  }
}
</script>

<style lang="scss">
@use "@material/theme/mdc-theme";
@use "@material/typography/mdc-typography";

// TODO: add link to Google Fonts for Roboto

// tabs
@use "@material/tab-bar/mdc-tab-bar";
@use "@material/tab-scroller/mdc-tab-scroller";
@use "@material/tab-indicator/mdc-tab-indicator";
@use "@material/tab/mdc-tab";

body {
  margin: 0;
  padding: 0;
  font-family: Roboto, sans-serif;
  background: #f8f9fa;
}

header {
  display: flex;
  flex-flow: row no-wrap;
  justify-content: space-between;
  padding: 0 2rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  background: #fff;

  .logo {
    display: inline-flex;
    flex-flow: row nowrap;
    align-items: center;
    align-self: center;
    font-family: 'Google Sans';
    cursor: pointer;

    img {
      margin-right: 0.5rem;
    }
  }

  .navigation {
    width: auto;
  }
}

main {
  margin: 2rem auto;
  padding: 0 2rem;
}

hr {
  margin: 2rem 0;
  color: rgba(0, 0, 0, 0.87); // TODO: replace by mdc variable
}
</style>
