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

import { PageId } from './page'

export type ResourceType = 'document' | 'font' | 'script' | 'stylesheet'

export type ResourceURL = string

export type Resource = {
  url: ResourceURL;
  cacheControl: string | null;
  transferSize: number;
  pages: PageId[];
  selectedPrefetch: boolean;
  prefetchOn: PageId | null;
  resourceType: ResourceType;
}

/**
 * Mapping from HarEntry resourceType field (added in HAR e.g. as _resourceType when exported by Chrome)
 * to the valid values used in the <link> as attribute for resource hints.
 *
 * Valid values for as attribute on <link>: https://www.w3.org/TR/preload/#as-attribute
 * Full list of values: https://fetch.spec.whatwg.org/#concept-request-destination
 */
export const ResourceTypeLinkMapping: Record<ResourceType, string> = {
  document: 'document',
  font: 'font',
  script: 'script',
  stylesheet: 'style'
}
