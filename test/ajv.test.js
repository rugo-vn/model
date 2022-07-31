/* eslint-disable */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { expect } from 'chai';

describe('Ajv test', () => {
  it('should validate schema', async () => {
    const schema = {
      title: 'Cat',
      description: 'Something fun about cat profile',
      type: 'object',
      properties: {
        name: { title: 'Name', description: 'Legal name', type: 'string', maxLength: 60, minLength: 3 },
        age: { type: 'integer', minimum: 1 },
        length: { type: 'number', maximum: 2 },
        male: { type: 'boolean', default: true },
        hobbies: { type: 'array', uniqueItems: true, maxItems: 3, items: { type: 'string' } },
        contact: { type: 'object', properties: { email: { type: 'string', format: 'email' }, phone: { type: 'string' }, address: {} } }
      },
      required: ['name', 'age'],
      additionalProperties: false
    };

    const ajv = new Ajv({ removeAdditional: true, useDefaults: true });
    addFormats(ajv);
    const validate = ajv.compile(schema);

    // full normal
    const doc1 = {
      name: 'meow',
      age: 3,
      length: 1.5,
      hobbies: ['play', 'sleep'],
      contact: { email: 'kitty@email.com', phone: '0103456789', address: '12 Sans, Forest' },
      likes: 10
    };
    const res1 = validate(doc1);

    expect(validate.errors).to.be.eq(null);
    expect(res1).to.be.eq(true);
  });
});
