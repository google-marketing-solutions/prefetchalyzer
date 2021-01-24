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

import { Page, PageId } from './page'
import { Resource, ResourceType } from './resource'

export interface AppState {
    hasData: boolean;
    activeView: AppView;
    pages: Page[];
    requests: Resource[];
}

// used to transfer parsed HAR data from FileUpload to App
export interface ParsedHAR {
    pages: Page[];
    resources: Resource[];
}

export type AppView = 'import' | 'about' | 'prefetch_opps'

// eslint-disable-next-line
export type JsonObject = Record<string, any>;

export interface AppTab {
    // reference to connected view
    key: AppView;
    // text shown on tab
    label: string;
    // whether displaying this tab requires HAR data to be available
    requiresData: boolean;
}

export type ResourceTypeFilter = Record<ResourceType, boolean>

export interface PrefetchTableFilters {
    collapseUnselected: boolean;
    shortenURLs: boolean;
    resourceTypes: ResourceTypeFilter;
}

export type ResourcesByPage = Record<PageId, Resource[]>

export type PagesByPageId = Record<PageId, Page>