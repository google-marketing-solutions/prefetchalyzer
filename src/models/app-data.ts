import { Page } from './page';
import { Resource } from './resource';

export interface AppState {
    // global state: has a parsed HAR file
    hasData: boolean
}

// used to transfer parsed HAR data from FileUpload to App
export interface ParsedHAR {
    pages: Page[],
    resources: Resource[]
}