<template>
  <div class="faq-container">
    <h2 class="mdc-typography--headline4">FAQ</h2>

    <h3 class="mdc-typography--headline5">What is a HAR file?</h3>
    <p class="mdc-typography--body2">
      HAR stands for <em>HTTP Archive Record</em>and describes a well-defined format to store HTTP sessions. It is based on JSON.
    </p>

    <h3 class="mdc-typography--headline5">How do I get a HAR file for analysis?</h3>
    <p class="mdc-typography--body2">There are many ways to generate HAR files. One option is to use Chrome Devtools.</p>
    <p class="mdc-typography--body2">
      Record a user journey in Chrome DevTools. Switch to the Network tab, make sure it is recording and the
      <em>Preserve log</em> option is enabled. Clear the network history, and keep the DevTools open all the time while you interact with the pages. Start navigating to the first page you want to analyze. Then proceed navigating
      and interacting with the pages until you finished the user journey. Right-click anywhere in the Network tab's resources list, and select
      <em>Save all as HAR with content</em>.
    </p>

    <h3 class="mdc-typography--headline5">How are the HAR files processed I upload in Prefetchalyzer?</h3>
    <p class="mdc-typography--body2">
      Although named <em>upload</em>, the HAR files you open with Prefetchalyzer are processed locally in your browser. No HAR data is stored or processed
      serverside, parsing and opportunity detection is done in JavaScript.
    </p>
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
</style>
