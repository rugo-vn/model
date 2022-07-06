/* eslint-disable */

import { expect } from 'chai';
import * as Boolean from '../src/types/boolean.js';

describe('Boolean', () => {
  it('should be boolean', () => {
    const cases = [
      { expected: true, inputs: ['1', 1, 'hello', true] },
      { expected: false, inputs: ['', 0, false, null, NaN, undefined ]}
    ];

    for (let c of cases){
      for (let input of c.inputs)
        expect(Boolean.type(input)).to.be.eq(c.expected);
    }
  });
});
