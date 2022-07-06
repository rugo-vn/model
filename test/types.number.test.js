/* eslint-disable */

import { expect, assert } from 'chai';
import * as Number from '../src/types/number.js';


describe('Number', () => {
  it('should be number', () => {
    const text = 1.2;
    expect(Number.type(text)).to.be.equal(text);
  });

  it('should be transformed to number', () => {
    const text = '1.2';
    expect(Number.type(text)).to.be.equal(parseFloat(text));
  });

  it('shoule be not number with null', () => {
    try {
      expect(Number.type(null)).to.be.equal(null);
    } catch(err){
      expect(err.message).to.be.equal(`Invalid type. Expected number but got null.`);
      return;
    }
  });

  it('shoule be not number', () => {
    const value = { foo: 'bar' };

    try {
      Number.type(value)
    } catch(err){
      expect(err.message).to.be.equal(`Invalid type. Expected number but got [object Object].`);
      return;
    }
    assert.fail();
  });

  it('shoule be not number - wrong transform', () => {
    const value = 'abc';

    try {
      Number.type(value)
    } catch(err){
      expect(err.message).to.be.equal(`Invalid type. Expected number but got abc.`);
      return;
    }
    assert.fail();
  });

  it('should be valid min', () => {
    const value = 3;
    expect(Number.min(value, 2)).to.be.equal(value);
  });

  it('should be not valid min', () => {
    try {
      const value = 3;
      Number.min(value, 10);
    } catch(err){
      expect(err.message).to.be.equal('Wrong data. 3 is lower than 10.');
      return;
    }
    assert.fail();
  });

  it('should be valid max', () => {
    const value = 3;
    expect(Number.max(value, 5)).to.be.equal(value);
  });

  it('should be not valid max', () => {
    try {
      const value = 3;
      Number.max(value, 2);
    } catch(err){
      expect(err.message).to.be.equal('Wrong data. 3 is greater than 2.');
      return;
    }
    assert.fail();
  });
}); 