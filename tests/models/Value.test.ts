/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2022, Daniel Jonathan <daniel at cosmicverse dot org>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import test from 'ava'

import { string } from 'yup'

import {
  Value,
  createValueFor,
} from '../../src'

class Email implements Value<string> {
  readonly value: string
  constructor(value: string) {
    this.value = value
  }
  updateValue(): void {
    console.log('HERE', 'amazing')
  }
}

const createEmailValue = createValueFor(Email, {
  created: (target: Readonly<Email>): void => {
    console.log('CREATED', target)
  },
  updated: (newTarget: Readonly<Email>, oldTarget: Readonly<Email>): void => {
    console.log('here')
    console.log('UPDATED', newTarget, oldTarget)
  },
  trace: (target: Readonly<Email>): void => {
    console.log('TRACE', target)
  },
  properties: {
    value: {
      validate: (value: string): boolean => 'string' === typeof string().email().strict(true).validateSync(value),
      updated: (newValue: string, oldValue: string, state: Readonly<Email>): void => {
        console.log('newValue', newValue, 'oldValue', oldValue, 'state', state)
      },
    },
  },
})

test('Value: createEmailValue', t => {
  const email = 'me@domain.com'
  const emailValue = createEmailValue(email)
  emailValue.updateValue()
  console.log('emailValue', emailValue)
  t.is(emailValue.value, email)
})