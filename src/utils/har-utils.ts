/**
 * Copyright 2020 Google LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 **/

import { HarStore } from '../stores/har'
import { JsonObject } from '@/models/app-data'

/**
 * A simple factory for loading a string input into a valid HAR store instance
 */
export function buildHarFromString(har: string): HarStore {
  let rawHar: JsonObject

  try {
    rawHar = JSON.parse(har)
  } catch (e) {
    throw new Error('Error: Could not parse HAR as JSON, invalid JSON structure in HAR.')
  }

  if (typeof (rawHar.log) === 'undefined' ||
      typeof (rawHar.log.pages) === 'undefined' ||
      typeof (rawHar.log.entries) === 'undefined') {
    throw new Error('Error: Missing required HAR properties: log, pages or entries.')
  }

  return new HarStore(rawHar)
}
