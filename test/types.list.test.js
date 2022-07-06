/* eslint-disable */

import { expect, assert } from 'chai';
import * as List from '../src/types/list.js';
import { types } from '../src/validate.js';

describe('List', () => {
  it('should be list', () => {
    const value = ['abc', 'def'];

    expect(List.type(value).length).to.be.equal(value.length)
  });

  it('should be list with schema field', () => {
    const value = ['abc', 'def'];

    expect(List.children(value, { type: 'text' }, types).length).to.be.equal(value.length)
  });

  it('should be not list', () => {
    // string
    const value = 'abc';

    try {
      List.type(value);
      assert.fail();
    } catch(err){
      expect(err.message).to.be.equal(`Invalid type. Expected list but got abc.`);
    }

    // object
    const value2 = { "abc": "def" };
    try {
      List.type(value2);
      assert.fail();
    } catch(err){
      expect(err.message).to.be.equal(`Invalid type. Expected list but got [object Object].`);
    }

    // not valid children schema
    const value3 = ['abc', 'def'];
    try {
      List.children(value3, { type: 'number' }, types);
      assert.fail();
    } catch(err){
      expect(err.message).to.be.equal(`Invalid type. Expected number but got abc.`);
    }

    // children trigger
    const value4 = [1, 10];
    try {
      List.children(value4, { type: 'number', max: 5, unknown: 0 }, types);
      assert.fail();
    } catch(err){
      expect(err.message).to.be.equal(`Wrong data. 10 is greater than 5.`);
    }
  });
});