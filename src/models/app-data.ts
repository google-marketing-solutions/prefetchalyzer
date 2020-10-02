import { Page } from './page';
import { Resource } from './resource';

export interface AppState {
    // global state: has a parsed HAR file
    hasData: boolean,
    activeView: AppView
}

// used to transfer parsed HAR data from FileUpload to App
export interface ParsedHAR {
    pages: Page[],
    resources: Resource[]
}

export type AppView = 'upload' | 'about' | 'prefetch_opps'

export interface AppTab {
    // reference to connected view
    key: AppView,
    // text shown on tab
    label: string,
    // whether displaying this tab requires HAR data to be available
    requiresData: boolean
}