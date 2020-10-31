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
    <div class="mdc-chip-set mdc-chip-set--choice" role="grid">
      <div class="mdc-chip" role="row"
        v-for="(optionValue, key) in value"
        v-bind:key="key"
        v-bind:class="{'mdc-chip--selected':optionValue }"
        v-on:click="handleSelection(key)">
        <div class="mdc-chip__ripple"></div>
        <span role="gridcell">
          <span role="button" class="mdc-chip__primary-action">
            <span class="mdc-chip__text">{{ key }}</span>
          </span>
        </span>
      </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class ChipMultiSelect extends Vue {
  @Prop() private value!: Record<string, boolean>

  handleSelection(key: string) {
    const updatedSelection = this.value
    updatedSelection[key] = !this.value[key]

    this.$emit('change', updatedSelection)
  }
}
</script>

<style scoped lang="scss">
  @use "@material/chips/mdc-chips";
</style>
