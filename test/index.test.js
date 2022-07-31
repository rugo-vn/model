/* eslint-disable */

import * as modelService from '../src/index.js';
import { ServiceBroker } from 'moleculer';
import { expect } from 'chai';

const driverService = {
  name: 'driver.mem',
  actions: {
    async count() { return 32; }
  }
}

for (let name of ['create', 'find', 'patch', 'remove']){
  driverService.actions[name] = async function({ params, meta }){
    return { name, params, meta, 0: params.filters && params.filters._id !== undefined ? 'ok' : null };
  }
}

const DEMO_SCHEMA = {
  name: 'cat',
  driver: 'mem',
  title: 'Cat',
  description: 'Something fun about cat profile',
  type: 'object',
  properties: {
    name: { title: 'Name', description: 'Legal name', type: 'string', maxLength: 60, minLength: 3 },
    age: { type: 'integer', minimum: 1 },
    length: { type: 'number', maximum: 2 },
    male: { type: 'boolean', default: true },
    hobbies: { type: 'array', uniqueItems: true, maxItems: 3, items: { type: 'string' } },
    contact: { type: 'object', properties: { email: { type: 'string', format: 'email' }, phone: { type: 'string' }, address: {} } },
  },
  required: ['name', 'age'],
  additionalProperties: false
}

describe('Model test', () => {
  let broker;

  beforeEach(async () => {

    broker = new ServiceBroker();
    broker.createService(driverService);
    broker.createService({
      ...modelService
    });

    await broker.start();
  });

  afterEach(async () => {
    await broker.stop();
  });

  it('should create a document', async () => {
    const resp = await broker.call('model.create', { doc: {
      name: 'meow',
      age: 3,
      length: 1.5,
      hobbies: ['play', 'sleep'],
      contact: { email: 'kitty@email.com', phone: '0103456789', address: '12 Sans, Forest' },
      likes: 10
    }}, { meta: { schema: DEMO_SCHEMA }});
    
    expect(resp).to.has.property('status', 'success');
    expect(resp.data).to.has.property('name', 'create');
    expect(resp.data).to.has.property('params');
    expect(resp.data).to.has.property('meta');
    expect(resp.data.meta).to.has.property('collection', 'cat');
    expect(resp.data.meta).to.has.property('driver', 'driver.mem');
  });

  it('should find documents', async () => {
    // normal find
    const resp = await broker.call('model.find', null, { meta: { schema: DEMO_SCHEMA }});
    expect(resp.data.params).to.has.property('limit', 10);
    expect(resp.data.params).to.has.property('skip', 0);
    expect(resp.pagination).to.has.property('total', 32);
    expect(resp.pagination).to.has.property('limit', 10);
    expect(resp.pagination).to.has.property('skip', 0);
    expect(resp.pagination).to.has.property('page', 1);
    expect(resp.pagination).to.has.property('npage', 4);

    // no pagination
    const res1 = await broker.call('model.find', { limit: 0 }, { meta: { schema: DEMO_SCHEMA }});
    expect(res1.data.params).to.has.property('limit', 0);
    expect(res1.data.params).to.has.property('skip', 0);
    expect(res1.pagination).to.be.eq(undefined);

    // skip limit pagination
    const res2 = await broker.call('model.find', { limit: 5, skip: 12 }, { meta: { schema: DEMO_SCHEMA }});
    expect(res2.data.params).to.has.property('limit', 5);
    expect(res2.data.params).to.has.property('skip', 12);
    expect(res2.pagination).to.has.property('total', 32);
    expect(res2.pagination).to.has.property('limit', 5);
    expect(res2.pagination).to.has.property('skip', 12);
    expect(res2.pagination).to.has.property('page', 3);
    expect(res2.pagination).to.has.property('npage', 7);

    // page pagination
    const res3 = await broker.call('model.find', { limit: 7, page: 3 }, { meta: { schema: DEMO_SCHEMA }});
    expect(res3.data.params).to.has.property('limit', 7);
    expect(res3.data.params).to.has.property('skip', 14);
    expect(res3.pagination).to.has.property('total', 32);
    expect(res3.pagination).to.has.property('limit', 7);
    expect(res3.pagination).to.has.property('skip', 14);
    expect(res3.pagination).to.has.property('page', 3);
    expect(res3.pagination).to.has.property('npage', 5);

    // page priotity
    const res4 = await broker.call('model.find', { limit: 7, page: 3, skip: 25 }, { meta: { schema: DEMO_SCHEMA }});
    expect(res4.data.params).to.has.property('limit', 7);
    expect(res4.data.params).to.has.property('skip', 14);
    expect(res4.pagination).to.has.property('total', 32);
    expect(res4.pagination).to.has.property('limit', 7);
    expect(res4.pagination).to.has.property('skip', 14);
    expect(res4.pagination).to.has.property('page', 3);
    expect(res4.pagination).to.has.property('npage', 5);

    // get all
    const res5 = await broker.call('model.find', { limit: -1, skip: 12 }, { meta: { schema: DEMO_SCHEMA }});
    expect(res5.data.params).to.not.has.property('limit');
    expect(res5.data.params).to.has.property('skip', 12);
    expect(res5.pagination).to.has.property('total', 32);
    expect(res5.pagination).to.has.property('limit', -1);
    expect(res5.pagination).to.has.property('skip', 12);
    expect(res5.pagination).to.has.property('page', 1);
    expect(res5.pagination).to.has.property('npage', 1);
  });

  it('should get', async () => {
    // normal
    const resp = await broker.call('model.get', { id: 0 }, { meta: { schema: DEMO_SCHEMA }});
    expect(resp).to.has.property('status', 'success');
    expect(resp).to.has.property('data', 'ok');

    // null
    const res1 = await broker.call('model.get', null, { meta: { schema: DEMO_SCHEMA }});
    expect(res1).to.has.property('status', 'success');
    expect(res1).to.has.property('data', null);
  });

  it('should patch', async () => {
    const resp = await broker.call('model.patch', { 
      id: 0, 
      set: { length: 1.75 }, 
      inc: { age: 1 }, 
      unset: { male: '' }
    }, { meta: { schema: DEMO_SCHEMA }});
    expect(resp).to.has.property('status', 'success');
    expect(resp).to.has.property('data', 'ok');
  });

  it('should remove', async () => {
    const resp = await broker.call('model.remove', { id: 0 }, { meta: { schema: DEMO_SCHEMA }});
    expect(resp).to.has.property('status', 'success');
    expect(resp).to.has.property('data', 'ok');
  });
  
});