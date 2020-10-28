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
  <div class="faq-container">
    <h2 class="mdc-typography--headline4">FAQ</h2>

    <h3 class="mdc-typography--headline5">HAR files and processing</h3>

    <h4 class="mdc-typography--headline6">What is a HAR file?</h4>
    <p class="mdc-typography--body2">
      HAR stands for <em>HTTP Archive Record</em>and describes a well-defined format to store HTTP sessions. It is based on JSON.
    </p>

    <h4 class="mdc-typography--headline6">How do I get a HAR file for analysis?</h4>
    <p class="mdc-typography--body2">There are many ways to generate HAR files. One option is to use Chrome Devtools.</p>
    <p class="mdc-typography--body2">
      Record a user journey in Chrome DevTools. Switch to the Network tab, make sure it is recording and the
      <em>Preserve log</em> option is enabled. Clear the network history, and keep the DevTools open all the time while you interact with the pages. Start
      navigating to the first page you want to analyze. Then proceed navigating and interacting with the pages until you finished the user journey. Right-click
      anywhere in the Network tab's resources list, and select <em>Save all as HAR with content</em>.
    </p>

    <h4 class="mdc-typography--headline6">How are the HAR files processed I import in Prefetchalyzer?</h4>
    <p class="mdc-typography--body2">
      The HAR files you import in Prefetchalyzer are opened and processed locally in your browser. No HAR data is stored or processed server-side, parsing and
      opportunity detection is done in client-side JavaScript.
    </p>
    <p class="mdc-typography--body2">All data imported and adjustments made by the user are not persisted and gone after a full reload of Prefetchalyzer.</p>

    <hr />
    <h3 class="mdc-typography--headline5">Prefetch analysis</h3>

    <h4 class="mdc-typography--headline6">What is resource prefetching?</h4>
    <p class="mdc-typography--body2">
      Prefetching is a performance optimization that aims to fetch resources needed on the next page, to speed up navigation and loading times. It can be
      implemented in multiple ways, of which the prefetch resource hint is among the easiest options. Typical candidates for prefetching are critical resources
      needed for the loading process, or large resources that would take a long time to download.
    </p>
    <p class="mdc-typography--body2">
      For best effectiveness, only predictable resources should be prefetched – e.g. on well-defined user journeys like a checkout process, or between landing
      and product pages.
    </p>

    <h4 class="mdc-typography--headline6">What does the prefetch analysis show to me?</h4>
    <p class="mdc-typography--body2">The prefetch analysis lists opportunities of resources that meet the minimum requirements for effective prefetching.</p>

    <h4 class="mdc-typography--headline6">Are resources pre-filtered for the prefetch analysis?</h4>
    <p class="mdc-typography--body2">
      Yes. For resource prefetching, most impact can be gained with critical resources that are needed throughout the initial loading process of a web page.
      This includes CSS, JavaScript, and potentially web fonts. HTML documents are also included, because prefetching a document allows instant navigation.
      Resources that did not respond with HTTP status code 200 are filtered out.
    </p>
    <p class="mdc-typography--body2">
      Although the pre-filtering is carefully designed, you need to manually adjust the list of resources to get reasonable results. Most likely, your sessions
      contain third-party scripts that are usually not recommended for resource prefetching.
    </p>

    <h4 class="mdc-typography--headline6">How are prefetching opportunities determined?</h4>
    <p class="mdc-typography--body2">
      The recorded HAR session, as imported in Prefetchalyzer, is presumed as a predictable user journey. It is the tool’s user’s responsibility to record a
      session representing a high probability that visitors follow this exact route. Resources need to have reasonable cache-control headers set, that allow
      browsers to cache resources for at least the duration of the user journey – even better, longer than that.
    </p>
    <p class="mdc-typography--body2">
      All resources that are required by the first page in the session are not considered for analysis at all, and filtered out from all pages. Given reasonable
      caching, all resources that are duplicated on the following pages are already in the browser’s HTTP cache, making prefetching for these resources
      redundant.
    </p>
    <p class="mdc-typography--body2">
      After initial filtering, the page on which a resource should be prefetched is determined. For each resource, the pages it appears on are checked, and the
      page on the step before the first appearance is marked for prefetching this particular resource.
    </p>
    <p class="mdc-typography--body2">
      For impactful visualization, all resources are first sorted by first appearance/page to prefetch in the user journey (path), and then by transferred size.
      This allows tool users to follow the navigation path and spot the largest resources at the top of each navigation step.
    </p>
    <br />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class About extends Vue {}
</script>

<style scoped lang="scss">
.faq-container {
  max-width: 40rem;
  margin: 0 auto;
}

h4 {
  margin: 1.5em 0 0.5em;
}
</style>
