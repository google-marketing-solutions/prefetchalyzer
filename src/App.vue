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
  <div id="app">
    <header>
      <a class="logo" @click="setActiveView('import')">
        <img src="./assets/logo.svg" width="24" height="24" />
        <span class="logo--emphasized">Prefetch</span>alyzer
      </a>
      <nav class="navigation mdc-tab-bar" role="tablist">
        <div class="mdc-tab-scroller">
          <div class="mdc-tab-scroller__scroll-area">
            <div class="mdc-tab-scroller__scroll-content">
              <button class="mdc-tab mdc-tab--active" role="tab" v-for="view in navigation" :key="view.key" @click="setActiveView(view.key)">
                <span class="mdc-tab__content">
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
      <FileUpload v-show="state.activeView === 'import'" @updateParsedHAR="updateParsedHAR" />

      <PrefetchTable
        v-show="state.hasData && state.activeView === 'prefetch_opps'"
        :pages="state.pages"
        :resources="state.requests"
        @openPageSettings="openPageSettings"
      />

      <About v-show="state.activeView === 'about'" />

      <div v-show="!state.hasData && state.activeView === 'prefetch_opps'" class="empty-view">
        <div class="empty-view__inner">
          <h1 class="mdc-typography--headline5">No data available</h1>
          <p class="mdc-typography--body1">Import a HAR session to start analysis.</p>
          <button class="mdc-button" @click="setActiveView('import')">
            <span class="mdc-button__label">Import data</span>
          </button>
        </div>
      </div>

      <div class="page-settings mdc-dialog" ref="dialog">
        <div class="mdc-dialog__container">
          <div
            class="page-settings__content mdc-dialog__surface"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="data-export"
            aria-describedby="data-export-dialog-content"
          >
            <div class="mdc-dialog__content" id="data-export-dialog-content">
              <PageSettings :pages="state.pages" @setTitle="updatePageTitle" />
            </div>
            <div class="mdc-dialog__actions">
              <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="done">
                <div class="mdc-button__ripple"></div>
                <span class="mdc-button__label">Done</span>
              </button>
            </div>
          </div>
        </div>
        <div class="mdc-dialog__scrim"></div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Ref } from 'vue-property-decorator'
import { Page } from './models/page'
import { HarStore } from '@/stores/har'
import { AppState, AppTab, AppView } from './models/app-data'
import About from './components/about.vue'
import FileUpload from './components/file-upload.vue'
import PageSettings from './components/page-settings.vue'
import PrefetchTable from './components/prefetch-table.vue'
import { MDCDialog } from '@material/dialog'

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
  @Ref() dialog!: HTMLElement

  private state: AppState = {
    hasData: false,
    activeView: 'import',
    pages: [],
    requests: []
  }

  private harStore: HarStore | null = null

  private navigation: AppTab[] = [
    {
      key: 'import',
      label: 'Import Session',
      requiresData: false
    },
    {
      key: 'prefetch_opps',
      label: 'Prefetch Analysis',
      requiresData: true
    },
    {
      key: 'about',
      label: 'FAQ',
      requiresData: false
    }
  ]

  // Material component reference
  private navigationMDC: MDCTabBar | null = null
  private dialogMDC: MDCDialog | null = null

  setActiveView(view: AppView) {
    this.state.activeView = view
    // check for tabs in navigation to update state
    const navIndex = this.navigation.findIndex((tab) => tab.key === this.state.activeView)
    if (navIndex !== -1) {
      this.navigationMDC && this.navigationMDC.activateTab(navIndex)
    }
  }

  updateParsedHAR(harStore: HarStore): void {
    this.harStore = harStore
    this.state.pages = this.harStore.getPages()
    this.state.requests = this.harStore.getResources()
    this.state.hasData = true
    this.setActiveView('prefetch_opps')
  }

  updatePageTitle(updatedPage: Page): void {
    const pageIndex = this.state.pages.findIndex((page) => page.id === updatedPage.id)
    if (pageIndex !== -1) {
      this.state.pages[pageIndex].label = updatedPage.label
    }
  }

  openPageSettings(): void {
    if (this.dialogMDC) {
      this.dialogMDC.open()
    }
  }

  mounted() {
    // Material components initialization
    // TODO: check for correct lifecycle hook
    const navigation = document.querySelector('.navigation')
    if (navigation) {
      this.navigationMDC = new MDCTabBar(navigation)
    }

    if (this.dialog) {
      this.dialogMDC = new MDCDialog(this.dialog)
    }
  }
}
</script>

<style lang="scss">
@use "@material/theme/mdc-theme";
@use "@material/button/mdc-button";
@use "@material/dialog/mdc-dialog";
@use "@material/tab-bar/mdc-tab-bar";
@use "@material/tab-scroller/mdc-tab-scroller";
@use "@material/tab-indicator/mdc-tab-indicator";
@use "@material/tab/mdc-tab";
@use "@material/textfield/mdc-text-field";
@use "@material/typography";

@include typography.core-styles;

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
    font-family: 'Google Sans', Roboto, sans-serif;
    cursor: pointer;

    img {
      margin-right: 0.5rem;
      border-radius: 0.125rem;
    }
  }

  .navigation {
    width: auto;
  }
}

.logo--emphasized {
  color: var(--mdc-theme-primary);
}

main {
  height: 90vh;
  max-height: calc(100vh - 4rem - 60px); // 60px approximation for header height
  margin: 2rem auto;
  padding: 0 2rem;
}

hr {
  margin: 2rem 0;
  color: rgba(0, 0, 0, 0.87); // TODO: replace by mdc variable
}

// TODO: move dialog into PageSettings component for encapsulation
.page-settings .page-settings__content {
  @media (min-width: 592px) {
    width: 80vw;
    max-width: 960px;
  }
}

.empty-view {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  opacity: 0.7;

  &__inner {
    max-width: 40rem;
    text-align: center;
  }
}
</style>
