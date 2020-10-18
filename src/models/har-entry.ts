import { PageId } from './page';

export interface HarEntry {
    pageRef: PageId,
    priority: string,
    resourceType: string,
    method: string,
    url: string,
    httpVersion: string,
    status: number,
    cacheControl: string,
    transferSize:  number
}
