const har = require('../../stores/har')
const chai = require('chai')
const deepEqualInAnyOrder = require('deep-equal-in-any-order')

chai.use(deepEqualInAnyOrder)

describe('Constructor init tests', () => {
  it('Stores a list of pages and entries extracted from the original HAR object', () => {
    const HARInput = JSON.parse(require('fs').readFileSync(__dirname + '/data/single-entry-valid.har'))
    const harStore = new har.HarStore(HARInput)
    const pages = harStore.pages
    const entries = harStore.entries

    chai.expect(pages).to.be.an('array').that.is.not.empty
    chai.expect(entries).to.be.an('array').that.is.not.empty
  })

  it('Should skip unmatched entries from being stored in the entries property', () => {
    const HARInput = JSON.parse(require('fs').readFileSync(__dirname + '/data/multi-entry-mixed-validity.har'))
    const harStore = new har.HarStore(HARInput)
    const entries = harStore.entries

    chai.expect(entries).to.be.an('array').that.is.not.empty
    chai.expect(entries).to.have.lengthOf(1)
  })
})

describe('extractEntry tests', () => {
  it('Returns an entry match false property if the entry does not match the defined pattern', () => {
    const HARInput = JSON.parse(require('fs').readFileSync(__dirname + '/data/single-entry-invalid.har'))
    const harStore = new har.HarStore(HARInput)
    const result = harStore.extractEntry(HARInput.log.entries[0])

    chai.expect(result.match).to.equal(false)
  })

  it('Parse, vaidate and extract a HAR entry objects with the required fields only', () => {
    const HARInput = JSON.parse(require('fs').readFileSync(__dirname + '/data/single-entry-valid.har'))
    const harStore = new har.HarStore(HARInput)
    const result = harStore.extractEntry(HARInput.log.entries[0])
    const expected = {
      match: true,
      resourceType: 'document',
      priority: 'VeryHigh',
      transferSize: 2863,
      pageRef: 'page_1',
      method: 'GET',
      url: 'https://www.google.com/whatever-random-url',
      httpVersion: 'http/2.0',
      status: 200,
      cacheControl: 'max-age=0'
    }

    chai.expect(result).to.deep.equal(expected)
  })

  it('Should consider cache control headers in response as optional and set as null whenever missing', () => {
    const HARInput = JSON.parse(require('fs').readFileSync(__dirname + '/data/single-entry-missing-cache-header.har'))
    const harStore = new har.HarStore(HARInput)
    const result = harStore.extractEntry(HARInput.log.entries[0])

    chai.expect(result.match).to.equal(true)
    chai.expect(result.cacheControl).to.equal(null)
  })
})

describe('getPageTransferSizes', () => {
  it('Should return an empty object if the HAR object has no pages', () => {
    const HARInput = JSON.parse(require('fs').readFileSync(__dirname + '/data/single-entry-invalid.har'))
    const harStore = new har.HarStore(HARInput)

    const result = harStore.getPageTransferSizes()
    const expected = {}

    chai.expect(harStore.pages).to.be.empty
    chai.expect(result).to.deep.equal(expected)
  })

  it('Should calculate page sizes by adding up transfer sizes from the entries on the object', () => {
    const HARInput = JSON.parse(require('fs').readFileSync(__dirname + '/data/multi-entry-all-valid.har'))
    const harStore = new har.HarStore(HARInput)

    const result = harStore.getPageTransferSizes()
    const expected = {
      'page_1': 689,
      'page_2': 650
    }

    chai.expect(result).to.deep.equal(expected)
  })
})

describe('getUrlPageOccurences tests', () => {
  it('Should return an empty object if the HAR instance has no valid pages or entries', () => {
    const HARInput = JSON.parse(require('fs').readFileSync(__dirname + '/data/single-entry-invalid.har'))
    const harStore = new har.HarStore(HARInput)

    const result = harStore.getUrlPageOccurences()
    const expected = {}

    chai.expect(result).to.deep.equal(expected)
  })

  it('Should return a map of urls and with lists of page IDs they occurred in', () => {
    const HARInput = JSON.parse(require('fs').readFileSync(__dirname + '/data/multi-entry-all-valid.har'))
    const harStore = new har.HarStore(HARInput)

    const result = harStore.getUrlPageOccurences()

    const expected = {
      'https://www.google.com/': ['page_1'],
      'https://www.google.com/sw.js': ['page_1'],
      'https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js': ['page_2'],
      'https://www.google.com/style.css': ['page_1', 'page_2']
    }

    chai.expect(result).to.deep.equal(expected)
  })
})

describe('getResources tests', () => {
  it('Should return a list of Resource items', () => {
    const HARInput = JSON.parse(require('fs').readFileSync(__dirname + '/data/multi-entry-all-valid.har'))
    const harStore = new har.HarStore(HARInput)
    const result = harStore.getResources()
    chai.expect(result).to.be.an('array').that.is.not.empty
  })

  it('Should ensure all resource entry URLs are unique (no repeated entries)', () => {
    const HARInput = JSON.parse(require('fs').readFileSync(__dirname + '/data/multi-entry-all-valid.har'))
    const harStore = new har.HarStore(HARInput)

    const result = harStore.getResources()

     const expected = [
       {
         url: 'https://www.google.com/',
         cacheControl: null,
         transferSize: 189,
         pages: ['page_1'],
         selectedPrefetch: true,
         prefetchOn: null
       },
       {
         url: 'https://www.google.com/style.css',
         cacheControl: 'public, max-age=31536000',
         transferSize: 300,
         pages: ['page_1', 'page_2'],
         selectedPrefetch: true,
         prefetchOn: null
       },
       {
         url: 'https://www.google.com/sw.js',
         cacheControl: 'max-age=0',
         transferSize: 200,
         pages: ['page_1'],
         selectedPrefetch: true,
         prefetchOn: null
       },
       {
         url: 'https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js',
         cacheControl: 'public, max-age=31536000',
         transferSize: 350,
         pages: ['page_2'],
         selectedPrefetch: true,
         prefetchOn: null
       }
     ]

      chai.expect(result).to.deep.equalInAnyOrder(expected)
  })
})

describe('getResources tests', () => {
  it('Should return a list of Page items', () => {
    const HARInput = JSON.parse(require('fs').readFileSync(__dirname + '/data/multi-entry-all-valid.har'))
    const harStore = new har.HarStore(HARInput)
    const result = harStore.getPages()

    chai.expect(result).to.be.an('array').that.is.not.empty
  })

  it('Should return list of pages along with their transfer sizes', () => {
    const HARInput = JSON.parse(require('fs').readFileSync(__dirname + '/data/multi-entry-all-valid.har'))
    const harStore = new har.HarStore(HARInput)
    const result = harStore.getPages()
    const expected = [
      {
        id: 'page_1',
        label: 'page_1',
        url: 'https://www.google.com/',
        transferSize: 689
      },
      {
        id: 'page_2',
        label: 'page_2',
        url: 'https://www.google.com/something-else',
        transferSize: 650
      },
      {
        id: 'page_3',
        label: 'page_3',
        url: 'https://www.google.com/a-third-page',
        transferSize: 0
      }
    ]

    chai.expect(result).to.deep.equal(expected)
  })
})