/* eslint-disable */

import { createBroker } from '@rugo-vn/service';
import { assert, expect } from 'chai';
import { AclError, NotFoundError } from '../src/exceptions.js';


const schema = {
  _name: 'cat',
  _driver: 'sample',
  _acls: ['get'],
  title: 'Cat',
  description: 'Something fun about cat profile',
  type: 'object',
  properties: {
    name: { title: 'Name', description: 'Legal name', type: 'string', maxLength: 60, minLength: 3 },
    age: { type: 'integer', minimum: 1 },
    length: { type: 'number', maximum: 2 },
    male: { type: 'boolean', default: true },
    hobbies: { type: 'array', uniqueItems: true, maxItems: 3, items: { type: 'string' } },
    contact: { type: 'object', properties: { email: { type: 'string', format: 'email' }, phone: { type: 'string' }, address: {}, mother: { type: 'relation', name: 'cat' }  } },
    father: { type: 'relation', name: 'cat' },
    parent: { type: 'array', items: { type: 'relation' }},
  },
  required: ['name', 'age'],
  additionalProperties: false
};
const schemaName = schema._name;

describe('model test', () => {
  let broker;

  before(async () => {
    // create broker
    broker = createBroker({
      _services: [
        './src/index.js',
        './test/sample.driver.js'
      ],
      _globals: {
        [`schema.${schemaName}`]: schema,
      },
    });

    await broker.loadServices();
    await broker.start();
  });

  after(async () => {
    await broker.close();
  });

  it('should find documents', async () => {
    // normal find
    const resp = await broker.call('model.find', { name: schemaName });

    expect(resp.data).to.has.property('limit', 10);
    expect(resp.data).to.has.property('skip', 0);
    expect(resp.meta).to.has.property('total', 32);
    expect(resp.meta).to.has.property('limit', 10);
    expect(resp.meta).to.has.property('skip', 0);
    expect(resp.meta).to.has.property('page', 1);
    expect(resp.meta).to.has.property('npage', 4);

    // no pagination
    const res1 = await broker.call('model.find', { limit: 0, name: schemaName });
    expect(res1.data).to.has.property('length', 0);
    expect(res1.meta).to.has.property('limit', 0);
    expect(res1.meta).to.has.property('skip', 0);

    // skip limit pagination
    const res2 = await broker.call('model.find', { limit: 5, skip: 12, name: schemaName });
    expect(res2.data).to.has.property('limit', 5);
    expect(res2.data).to.has.property('skip', 12);
    expect(res2.meta).to.has.property('total', 32);
    expect(res2.meta).to.has.property('limit', 5);
    expect(res2.meta).to.has.property('skip', 12);
    expect(res2.meta).to.has.property('page', 3);
    expect(res2.meta).to.has.property('npage', 7);

    // page pagination
    const res3 = await broker.call('model.find', { limit: 7, page: 3, name: schemaName });
    expect(res3.data).to.has.property('limit', 7);
    expect(res3.data).to.has.property('skip', 14);
    expect(res3.meta).to.has.property('total', 32);
    expect(res3.meta).to.has.property('limit', 7);
    expect(res3.meta).to.has.property('skip', 14);
    expect(res3.meta).to.has.property('page', 3);
    expect(res3.meta).to.has.property('npage', 5);

    // page priotity
    const res4 = await broker.call('model.find', { limit: 7, page: 3, skip: 25, name: schemaName });
    expect(res4.data).to.has.property('limit', 7);
    expect(res4.data).to.has.property('skip', 14);
    expect(res4.meta).to.has.property('total', 32);
    expect(res4.meta).to.has.property('limit', 7);
    expect(res4.meta).to.has.property('skip', 14);
    expect(res4.meta).to.has.property('page', 3);
    expect(res4.meta).to.has.property('npage', 5);

    // get all
    const res5 = await broker.call('model.find', { limit: -1, skip: 12, name: schemaName });
    expect(res5.data).to.not.has.property('limit');
    expect(res5.data).to.has.property('skip', 12);
    expect(res5.meta).to.has.property('total', 32);
    expect(res5.meta).to.has.property('limit', -1);
    expect(res5.meta).to.has.property('skip', 12);
    expect(res5.meta).to.has.property('page', 1);
    expect(res5.meta).to.has.property('npage', 1);
  });

  it('should count documents', async () => {
    // normal find
    const resp = await broker.call('model.count', { name: schemaName });

    expect(resp).to.has.property('data', 32);
    expect(resp).to.not.has.property('meta');
  });

  it('should create a document', async () => {
    const resp = await broker.call('model.create', { data: {
      name: 'meow',
      age: 3,
      length: 1.5,
      hobbies: ['play', 'sleep'],
      contact: { email: 'kitty@email.com', phone: '0103456789', address: '12 Sans, Forest' },
      likes: 10,
      father: 'dog',
    }, name: schemaName });
    
    expect(resp.data).to.has.property('data');
    expect(resp.data).to.has.property('schema');
  });

  it('should update', async () => {
    const resp = await broker.call('model.update', { 
      id: 0, 
      set: { length: 1.75, contact: { mother: 'cow' } }, 
      inc: { age: 1 }, 
      unset: { male: '' }
   , name: schemaName });

    expect(resp.data.query).to.has.property('_id', 0);
  });

  it('should remove', async () => {
    const resp = await broker.call('model.remove', { id: 0, name: schemaName });
    
    expect(resp.data.query).to.has.property('_id', 0);
  });

  it('should get', async () => {
    // normal
    const resp = await broker.call('model.get', { id: 0, name: schemaName });
    expect(resp.data.query).to.has.property('_id', 0);

    // null
    try {
      await broker.call('model.get', { name: schemaName });
      assert.fail('should error');
    } catch(errs) {
      expect(errs[0] instanceof NotFoundError).to.be.eq(true);
    }
  });

  it('should acl', async () => {
    const resp = await broker.call('model.get', { id: 0, name: schemaName, acl: true });
    expect(resp.data.query).to.has.property('_id', 0);

    try {
      await broker.call('model.count', { name: schemaName, acl: true });
      assert.fail('should error');
    } catch(errs) {
      expect(errs[0] instanceof AclError).to.be.eq(true);
    }
  });
});
