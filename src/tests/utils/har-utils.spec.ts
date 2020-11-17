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
import { buildHarFromString, convertMimeTypeToResourceType } from '@/utils/har-utils'
import { loadTestObjectFromFile } from '@/tests/test-utils'

export default function run() {
  describe('buildHarFromString tests', () => {
    it('Throws an exception when the JSON string is invalid', () => {
      const HARInput = '{"name":whatever}'

      chai.expect(() => {
        buildHarFromString(HARInput)
      }).to.throw('Error: Could not parse HAR as JSON, invalid JSON structure in HAR.')
    })

    it('Throws an exception when HAR is missing pages and entries properties', () => {
      const HARInput = '{"name":"something"}'

      chai.expect(() => {
        buildHarFromString(HARInput)
      }).to.throw('Error: Missing required HAR properties: log, pages or entries.')
    })

    it('Should create a new HarStore instance', () => {
      const HARInput = loadTestObjectFromFile('single-entry-valid.har')
      const harStore = buildHarFromString(JSON.stringify(HARInput))

      chai.expect(harStore).to.have.property('entries')
      chai.expect(harStore).to.have.property('pages')
      chai.expect(harStore.entries).to.be.an('array').that.is.not.empty
      chai.expect(harStore.pages).to.be.an('array').that.is.not.empty
    })
  })

  describe('convertMimeTypeToResourceType tests', () => {
    it('Should return ResourceType strings for valid MIME types', () => {
      let convertedType = convertMimeTypeToResourceType('text/html')
      chai.expect(convertedType).to.equal('document')

      convertedType = convertMimeTypeToResourceType('font/otf')
      chai.expect(convertedType).to.equal('font')
      convertedType = convertMimeTypeToResourceType('font/ttf')
      chai.expect(convertedType).to.equal('font')
      convertedType = convertMimeTypeToResourceType('font/woff')
      chai.expect(convertedType).to.equal('font')
      convertedType = convertMimeTypeToResourceType('font/woff2')
      chai.expect(convertedType).to.equal('font')
      convertedType = convertMimeTypeToResourceType('application/vnd.ms-fontobject')
      chai.expect(convertedType).to.equal('font')

      convertedType = convertMimeTypeToResourceType('application/javascript')
      chai.expect(convertedType).to.equal('script')
      convertedType = convertMimeTypeToResourceType('text/javascript')
      chai.expect(convertedType).to.equal('script')

      convertedType = convertMimeTypeToResourceType('text/css')
      chai.expect(convertedType).to.equal('stylesheet')
    })

    it('Should return NULL for unexisting or invalid MIME types', () => {
      let convertedType = convertMimeTypeToResourceType('none')
      chai.expect(convertedType).to.be.null

      convertedType = convertMimeTypeToResourceType('application/json')
      chai.expect(convertedType).to.be.null

      convertedType = convertMimeTypeToResourceType('javascript')
      chai.expect(convertedType).to.be.null
    })
  })
}
