/* eslint-disable */

import { expect, assert } from 'chai';
import * as Text from '../src/types/text.js';

describe('Text', () => {
  it('should be text', () => {
    const text = 'hello';
    expect(Text.type(text)).to.be.equal(text);
  });

  it('shoule be null not text', () => {
    const value = null;

    try {
      Text.type(value)
    } catch(err){
      expect(err.message).to.be.equal(`Invalid type. Expected text but got null.`);
      return;
    }
    assert.fail();
  });

  it('shoule be undefined not text', () => {
    const value = undefined;

    try {
      Text.type(value)
    } catch(err){
      expect(err.message).to.be.equal(`Invalid type. Expected text but got undefined.`);
      return;
    }
    assert.fail();
  });

  it('shoule be not text', () => {
    const value = { foo: 'bar' };

    try {
      Text.type(value)
    } catch(err){
      expect(err.message).to.be.equal(`Invalid type. Expected text but got [object Object].`);
      return;
    }
    assert.fail();
  });

  it('should be valid min length', () => {
    const text = 'hello';
    expect(Text.minlength(text, 3)).to.be.equal(text);
  });

  it('should be not valid min length', () => {
    const text = 'hello';
    try {
      Text.minlength(text, 10);
    } catch(err){
      expect(err.message).to.be.equal('Wrong data. hello length is lower than 10.');
      return;
    }
    assert.fail();
  });

  it('should be valid max length', () => {
    const text = 'hello';
    expect(Text.maxlength(text, 10)).to.be.equal(text);
  });

  it('should be not valid max length', () => {
    const text = 'hello';
    try {
      Text.maxlength(text, 3);
    } catch(err){
      expect(err.message).to.be.equal('Wrong data. hello length is greater than 3.');
      return;
    }
    assert.fail();
  });

  it('should be valid regex', () => {
    const text = 'hello';
    expect(Text.regex(text, '^.ell.$')).to.be.equal(text);
  });

  it('should be not valid regex', () => {
    const text = 'hello';
    try {
      Text.regex(text, 'he.+llo');
    } catch(err){
      expect(err.message).to.be.equal('Wrong data. hello is not match regex.');
      return;
    }
    assert.fail();
  });

  it('should be transform', () => {
    const text = '  heLlO  ';
    expect(Text.trim(text)).to.be.equal(text.trim());
    expect(Text.lowercase(text)).to.be.equal(text.toLowerCase());
    expect(Text.uppercase(text)).to.be.equal(text.toUpperCase());
  });

  it('should be valid enum', () => {
    const text = 'foo';
    expect(Text.choice(text, ['foo', 'bar'])).to.be.equal(text);
  });

  it('should be not valid enum', () => {
    const text = 'hello';
    try {
      Text.choice(text, ['foo', 'bar']);
      assert.fail();
    } catch(err){
      expect(err.message).to.be.equal('Wrong data. hello is not valid choice.');
    }
  });
}); 