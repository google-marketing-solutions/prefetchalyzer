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

import path from 'path'
import chai from 'chai'
import { buildHarFromString } from '../../utils/har-utils'
import { loadTestObjectFromFile } from '../test-utils'

export default function run() {
  describe('buildHarFromString tests', () => {
    it('Throws an exception when the JSON string is invalid', () => {
      const HARInput = '{"name":whatever}'

      chai.expect(() => {
        buildHarFromString(HARInput)
      }).to.throw('Invalid JSON structure in HAR')
    })

    it('Throws an exception when HAR is missing pages and entries properties', () => {
      const HARInput = '{"name":"something"}'

      chai.expect(() => {
        buildHarFromString(HARInput)
      }).to.throw('Missing required HAR properties, log, pages or entries')
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
}
