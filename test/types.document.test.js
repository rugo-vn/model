/* eslint-disable */

import { expect, assert } from 'chai';
import * as Document from '../src/types/document.js';
import validate from '../src/validate.js';

describe('List', () => {
  it('should be document', async () => {
    const value = { foo: 'bar' };
    expect(Document.type(value)).to.has.property('foo', 'bar');

    const value2 = '{ "foo": "bar" }';
    expect(Document.type(value2)).to.has.property('foo', 'bar');
  });

  it('should be document with schema field', () => {
    const value = { info: { foo: 'bar' } };

    const result = validate({ 
      info: {
        type: 'document',
        schema: {
          foo: { type: 'text' }
        }
      }
    }, value);

    expect(result).to.has.property('info');
    expect(result.info).to.has.property('foo', 'bar');
  });

  it('should be not document', async () => {
    try {
      Document.type(123);
      assert.fail();
    } catch(err){
      expect(err.message).to.be.equal(`Invalid type. Expected document but got 123.`);
    }

    try {
      Document.type('abc');
      assert.fail();
    } catch(err){
      expect(err.message).to.be.equal(`Invalid type. Expected document but got abc.`);
    }
  });

});