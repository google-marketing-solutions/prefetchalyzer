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

import chai from 'chai'
import { HarStore } from '@/stores/har'
import { loadTestObjectFromFile } from '@/tests/test-utils'
import { ResourceURL } from '@/models/resource'
import { PageId } from '@/models/page'

export default function run() {
  describe('Constructor init tests', () => {
    it('Should initialize a debug log', () => {
      const HARInput = loadTestObjectFromFile('single-entry-valid.har')
      const harStore = new HarStore(HARInput)

      chai.expect(harStore).to.have.property('debugLog')

      const debugLog = harStore.debugLog

      chai.expect(debugLog).to.have.property('invalidPages')
      chai.expect(debugLog).to.have.property('invalidEntries')
      chai.expect(debugLog).to.have.property('statistics')
    })

    it('Stores a list of pages and entries extracted from the original HAR object', () => {
      const HARInput = loadTestObjectFromFile('single-entry-valid.har')
      const harStore = new HarStore(HARInput)
      const pages = harStore.pages
      const entries = harStore.entries

      chai.expect(pages).to.be.an('array').that.is.not.empty
      chai.expect(entries).to.be.an('array').that.is.not.empty
    })

    it('Should extract a list of pages and entries from a standard HAR object without custom attributes', () => {
      const HARInput = loadTestObjectFromFile('multi-entry-standard-har-valid.har')
      const harStore = new HarStore(HARInput)
      const pages = harStore.pages
      const entries = harStore.entries

      chai.expect(pages).to.be.an('array').that.is.not.empty
      chai.expect(entries).to.be.an('array').that.is.not.empty
    })

    it('Should skip unmatched entries from being stored in the entries property', () => {
      const HARInput = loadTestObjectFromFile('multi-entry-mixed-validity.har')
      const harStore = new HarStore(HARInput)
      const entries = harStore.entries

      chai.expect(entries).to.be.an('array').that.is.not.empty
      chai.expect(entries).to.have.lengthOf(1)
      chai.expect(harStore.debugLog.invalidEntries).to.have.lengthOf(3)
    })
  })

  describe('extractEntry tests', () => {
    it('Returns a null if the entry does not match the defined pattern', () => {
      const HARInput = loadTestObjectFromFile('single-entry-invalid.har')
      const harStore = new HarStore(HARInput)
      const result = harStore.extractEntry(HARInput.log.entries[0])

      chai.expect(result).to.equal(null)
    })

    it('Parse, validate and extract a HAR entry object with the required fields only', () => {
      const HARInput = loadTestObjectFromFile('single-entry-valid.har')
      const harStore = new HarStore(HARInput)
      const result = harStore.extractEntry(HARInput.log.entries[0])
      const expected = {
        resourceType: 'document',
        priority: 'VeryHigh',
        size: 2863,
        pageRef: 'page_1',
        method: 'GET',
        url: 'https://www.google.com/whatever-random-url',
        httpVersion: 'http/2.0',
        status: 200,
        cacheControl: 'max-age=0'
      }

      chai.expect(result).to.deep.equal(expected)
    })

    it('Should consider cache-control headers in response as optional and set as null whenever missing', () => {
      const HARInput = loadTestObjectFromFile('single-entry-missing-cache-header.har')
      const harStore = new HarStore(HARInput)
      const result = harStore.extractEntry(HARInput.log.entries[0])

      chai.expect(result).to.not.equal(null)
      if (result !== null) {
        chai.expect(result.cacheControl).to.equal(null)
      }
    })

    it('Should only allow entries with a status code 200', () => {
      const HARInput = loadTestObjectFromFile('single-entry-404.har')
      const harStore = new HarStore(HARInput)
      const result = harStore.extractEntry(HARInput.log.entries[0])

      chai.expect(result).to.equal(null)
    })

    it('Should use the _transferSize over size attribute if available', () => {
      const HARInput = loadTestObjectFromFile('entry-optional-attributes-test.har')
      const harStore = new HarStore(HARInput)

      const optionalResult = harStore.extractEntry(HARInput.log.entries[0])
      chai.expect(optionalResult).to.be.not.null
      if (optionalResult !== null) {
        chai.expect(optionalResult.size).to.equal(1111)
      }

      const regularResult = harStore.extractEntry(HARInput.log.entries[1])
      chai.expect(regularResult).to.be.not.null
      if (regularResult !== null) {
        chai.expect(regularResult.size).to.equal(9999)
      }
    })

    it('Should use the _resourceType over mimeType attribute if available', () => {
      const HARInput = loadTestObjectFromFile('entry-optional-attributes-test.har')
      const harStore = new HarStore(HARInput)

      const optionalResult = harStore.extractEntry(HARInput.log.entries[0])
      chai.expect(optionalResult).to.be.not.null
      if (optionalResult !== null) {
        chai.expect(optionalResult.resourceType).to.equal('stylesheet')
      }

      const regularResult = harStore.extractEntry(HARInput.log.entries[1])
      chai.expect(regularResult).to.be.not.null
      if (regularResult !== null) {
        chai.expect(regularResult.resourceType).to.equal('document')
      }
    })

    it('Should use the _priority attribute if available, and set to null if unavailable', () => {
      const HARInput = loadTestObjectFromFile('entry-optional-attributes-test.har')
      const harStore = new HarStore(HARInput)

      const resultWithPriorityField = harStore.extractEntry(HARInput.log.entries[0])
      chai.expect(resultWithPriorityField).to.be.not.null
      if (resultWithPriorityField !== null) {
        chai.expect(resultWithPriorityField.priority).to.equal('VeryHigh')
      }

      const regularResult = harStore.extractEntry(HARInput.log.entries[1])
      chai.expect(regularResult).to.be.not.null
      if (regularResult !== null) {
        chai.expect(regularResult.priority).to.be.null
      }
    })
  })

  describe('extractPage tests', () => {
    it('Returns a null if the page entry does not match the defined pattern', () => {
      const HARInput = loadTestObjectFromFile('single-entry-invalid.har')
      const harStore = new HarStore(HARInput)
      const result = harStore.extractPage(HARInput.log.pages[0])

      chai.expect(result).to.equal(null)
    })

    it('Parses, validates and extracts a HAR page object with the required fields only', () => {
      const HARInput = loadTestObjectFromFile('single-entry-valid.har')
      const harStore = new HarStore(HARInput)
      const result = harStore.extractPage(HARInput.log.pages[0])
      const expected = {
        startedDateTime: '2020-09-24T03:36:35.760Z',
        id: 'page_1',
        title: 'https://www.google.com/whatever-random-url',
        url: 'https://www.google.com/whatever-random-url'
      }

      chai.expect(result).to.deep.equal(expected)
    })

    it('Should detect page URL from title field', () => {
      const HARInput = loadTestObjectFromFile('entry-optional-attributes-test.har')
      const harStore = new HarStore(HARInput)

      const result = harStore.extractPage(HARInput.log.pages[1])
      chai.expect(result).to.be.not.null
      if (result !== null) {
        chai.expect(result.url).to.equal(HARInput.log.pages[1].title)
      }
    })

    it('Should find page URL from entries if not defined in title', () => {
      const HARInput = loadTestObjectFromFile('entry-optional-attributes-test.har')
      const harStore = new HarStore(HARInput)

      const result = harStore.extractPage(HARInput.log.pages[0])
      chai.expect(result).to.be.not.null
      if (result !== null) {
        chai.expect(result.url).to.equal('https://www.google.com/')
      }
    })

    it('Should set page URL to null if not found from entries', () => {
      const HARInput = loadTestObjectFromFile('entry-optional-attributes-test.har')
      const harStore = new HarStore(HARInput)

      const result = harStore.extractPage(HARInput.log.pages[2])
      chai.expect(result).to.be.not.null
      if (result !== null) {
        chai.expect(result.url).to.be.null
      }
    })
  })

  describe('getPageSizes', () => {
    it('Should return an empty object if the HAR object has no pages', () => {
      const HARInput = loadTestObjectFromFile('single-entry-invalid.har')
      const harStore = new HarStore(HARInput)

      const result = harStore.getPageSizes()
      const expected = {}

      chai.expect(harStore.pages).to.be.empty
      chai.expect(result).to.deep.equal(expected)
    })

    it('Should calculate page sizes by adding up transfer sizes from the entries on the object', () => {
      const HARInput = loadTestObjectFromFile('multi-entry-all-valid.har')
      const harStore = new HarStore(HARInput)

      const result = harStore.getPageSizes()
      const expected = {
        page_1: 689,
        page_2: 650
      }

      chai.expect(result).to.deep.equal(expected)
    })
  })

  describe('getUrlPageOccurences tests', () => {
    it('Should return an empty object if the HAR instance has no valid pages or entries', () => {
      const HARInput = loadTestObjectFromFile('single-entry-invalid.har')
      const harStore = new HarStore(HARInput)

      const result = harStore.getUrlPageOccurences()
      const expected = {}

      chai.expect(result).to.deep.equal(expected)
    })

    it('Should return a map of urls and with lists of page IDs they occurred in', () => {
      const HARInput = loadTestObjectFromFile('multi-entry-all-valid.har')
      const harStore = new HarStore(HARInput)

      const result = harStore.getUrlPageOccurences()

      const expected: Record<ResourceURL, Set<PageId>> = {
        'https://www.google.com/': new Set(['page_1']),
        'https://www.google.com/sw.js': new Set(['page_1']),
        'https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js': new Set(['page_2']),
        'https://www.google.com/style.css': new Set(['page_1', 'page_2'])
      }

      chai.expect(result).to.deep.equal(expected)

      const urls = Object.keys(expected)
      urls.forEach(url => {
        const expectedPages = [...expected[url]]
        const resultPages = [...result[url]]
        chai.expect(expectedPages).to.deep.equal(resultPages)
      })
    })
  })

  describe('getResources tests', () => {
    it('Should return a list of Resource items', () => {
      const HARInput = loadTestObjectFromFile('multi-entry-all-valid.har')
      const harStore = new HarStore(HARInput)
      const result = harStore.getResources()
      chai.expect(result).to.be.an('array').that.is.not.empty
    })

    it('Should ensure all resource entry URLs are unique (no repeated entries)', () => {
      const HARInput = loadTestObjectFromFile('multi-entry-all-valid.har')
      const harStore = new HarStore(HARInput)

      const result = harStore.getResources()

      const expected = [
        {
          url: 'https://www.google.com/',
          cacheControl: null,
          size: 189,
          pages: new Set(['page_1']),
          resourceType: 'document',
          selectedPrefetch: true,
          prefetchOn: null
        },
        {
          url: 'https://www.google.com/style.css',
          cacheControl: 'public, max-age=31536000',
          size: 300,
          pages: new Set(['page_1', 'page_2']),
          resourceType: 'stylesheet',
          selectedPrefetch: true,
          prefetchOn: null
        },
        {
          url: 'https://www.google.com/sw.js',
          cacheControl: 'max-age=0',
          size: 200,
          pages: new Set(['page_1']),
          resourceType: 'script',
          selectedPrefetch: true,
          prefetchOn: null
        },
        {
          url: 'https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js',
          cacheControl: 'public, max-age=31536000',
          size: 350,
          pages: new Set(['page_2']),
          resourceType: 'script',
          selectedPrefetch: true,
          prefetchOn: null
        }
      ]

      result.forEach(resultItem => {
        chai.expect(expected).to.deep.include(resultItem)
        const match = expected.find(resource => resource.url === resultItem.url)
        chai.expect(match).to.be.not.undefined
        if (match !== undefined) {
          const expectedPages = [...match.pages]
          const resultPages = [...resultItem.pages]
          chai.expect(expectedPages).to.deep.equal(resultPages)
        }
      })
    })
  })

  describe('getPages tests', () => {
    it('Should return a list of Page items', () => {
      const HARInput = loadTestObjectFromFile('multi-entry-all-valid.har')
      const harStore = new HarStore(HARInput)
      const result = harStore.getPages()

      chai.expect(result).to.be.an('array').that.is.not.empty
    })

    it('Should return list of pages along with their transfer sizes', () => {
      const HARInput = loadTestObjectFromFile('multi-entry-all-valid.har')
      const harStore = new HarStore(HARInput)
      const result = harStore.getPages()
      const expected = [
        {
          id: 'page_1',
          label: 'page_1',
          url: 'https://www.google.com/',
          size: 689
        },
        {
          id: 'page_2',
          label: 'page_2',
          url: 'https://www.google.com/something-else',
          size: 650
        },
        {
          id: 'page_3',
          label: 'page_3',
          url: 'https://www.google.com/a-third-page',
          size: 0
        }
      ]

      chai.expect(result).to.deep.equal(expected)
    })
  })
}
