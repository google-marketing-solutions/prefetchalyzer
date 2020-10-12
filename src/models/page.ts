export interface Page {
    // TODO: needs 'order' property to e.g. sort requests in order
    // TODO: add 'selected' property to allow removing pages from the session (for analysis)
    id: PageId,
    label: string,
    url: string,
    transferSize: number
}

export type PageId = string
