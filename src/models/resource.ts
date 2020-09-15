import { PageId } from './page';

export type Resource = {
    url: ResourceURL,
    cacheControl: string, // TODO: make nullable for unavailable header?
    transferSize: number,
    pages: PageId[],
    selectedPrefetch: boolean,
    prefetchOn: PageId | null
    // TODO: add 'type' property in future
    // type: ResourceType
}

export type ResourceURL = string

// TODO: add 'type' property in future
// export type ResourceType = "document" | "font" | "script" | "stylesheet"