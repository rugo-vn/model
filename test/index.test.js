/* eslint-disable */

import { expect, assert } from 'chai';

import { COLLECTION } from '../src/constants.js';
import createFakeDriver from '../src/driver.js';
import createModel from '../src/index.js';
import { types } from '../src/validate.js';

types.upload = {
  type(value){
    if (typeof value !== 'string')
      throw new InvalidTypeError(value, 'upload');

    return value;
  }
}

const DEMO_SCHEMA = {
  __name: 'demo',
  name: { type: 'text', required: true },
  slug: { type: 'text', default: '%unislug:name%', editable: false },
  age: { type: 'number', max: 10, min: 1 },
  kind: { type: 'text', default: 'human' },
  avatar: { type: 'upload' }
}

const FS_SCHEMA = {
  __name: 'foo',
  __type: 'fs'
}

describe('Model test', () => {
  let fakeDriver;

  beforeEach(async () => {
    fakeDriver = await createFakeDriver();
  });

  afterEach(async () => {
    await fakeDriver.close();
  });

  it('should run', async () => {
    const model = await createModel(fakeDriver, DEMO_SCHEMA);

    for (let key in COLLECTION)
      expect(model).to.has.property(key);
  });

  describe('Query test', () => {

    it('should create', async () => {
      const model = await createModel(fakeDriver, DEMO_SCHEMA);

      const doc = await model.create({ name: 'This is a foo quéstion', avatar: '/cat.png' });

      expect(doc).to.has.property('name', 'This is a foo quéstion');
      expect(doc).to.has.property('slug', 'this-is-a-foo-question');
      expect(doc).to.has.property('avatar', '/cat.png');
    });

    it('should get', async () => {
      const model = await createModel(fakeDriver, DEMO_SCHEMA);

      const doc = await model.create({ name: 'foo', kind: 'animal' });
      const doc2 = await model.get(doc._id);

      expect(doc2).to.has.property('name', 'foo');
      expect(doc2).to.has.property('kind', 'animal');
    });

    it('should get with string id', async () => {
      const model = await createModel(fakeDriver, DEMO_SCHEMA);

      const doc = await model.create({ name: 'foo' });
      const doc2 = await model.get(doc._id.toString());

      expect(doc2).to.has.property('name', 'foo');
      expect(doc2).to.has.property('kind', 'human');
    });

    it('should list', async () => {
      const model = await createModel(fakeDriver, DEMO_SCHEMA);

      await model.create({ name: 'foo' });
      const res = await model.list({});

      expect(res).to.has.property('total', 1);
      expect(res).to.has.property('skip', 0);
      expect(res).to.has.property('limit', 10);
      expect(res).to.has.property('data');
      expect(res.data.length).to.be.eq(1);
      expect(res.data[0]).to.has.property('_id');
      expect(res.data[0]).to.has.property('name', 'foo');
      expect(res.data[0]).to.has.property('kind', 'human');
    });

    it('should list with limit', async () => {
      const model = await createModel(fakeDriver, DEMO_SCHEMA);

      await model.create({ name: 'foo' });
      const res = await model.list({ $limit: 1, $sort: { name: 1 }, $skip: 'abc' });

      expect(res).to.has.property('total', 1);
      expect(res).to.has.property('skip', 0);
      expect(res).to.has.property('limit', 1);
      expect(res).to.has.property('data');
      expect(res.data.length).to.be.eq(1);
      expect(res.data[0]).to.has.property('_id');
      expect(res.data[0]).to.has.property('name', 'foo');
      expect(res.data[0]).to.has.property('kind', 'human');

      const res2 = await model.list({ $limit: '-1', $sort: { name: '-1', kind: 'xxx' }, $skip: '1' });
      expect(res2).to.has.property('total', 1);
      expect(res2).to.has.property('skip', 1);
      expect(res2).to.has.property('limit', -1);
      expect(res2).to.has.property('data');
    });

    it('should patch', async () => {
      const model = await createModel(fakeDriver, DEMO_SCHEMA);

      const doc = await model.create({ name: 'foo' });
      const res = await model.patch(doc._id, { name: 'bar', slug: 'bar' });

      expect(res).to.be.eq(1);

      const doc2 = await model.get(doc._id);
      expect(doc2).to.has.property('name', 'bar');
      expect(doc2).to.has.property('slug', 'foo');
    });

    it('should patch with null value to remove field', async () => {
      const model = await createModel(fakeDriver, DEMO_SCHEMA);

      const doc = await model.create({ name: 'foo', age: 5 });
      const res = await model.patch(doc._id, { age: null });

      expect(res).to.be.eq(1)

      const doc2 = await model.get(doc._id);
      expect(doc2).not.to.has.property('age');
    });

    it('should remove', async () => {
      const model = await createModel(fakeDriver, DEMO_SCHEMA);

      const doc = await model.create({ name: 'foo' });
      const res = await model.remove(doc._id);
      const doc3 = await model.get(doc._id);

      expect(res).to.be.eq(1);
      expect(doc3).to.be.eq(null);
    });
  });

  describe('Trigger test', () => {
    it('invalid type error', async () => {
      const model = await createModel(fakeDriver, DEMO_SCHEMA);

      try {
        await model.create({
          name: 'foo',
          age: 'abc'
        });
      } catch(err){
        expect(err.message).to.be.eq('At the age field: Invalid type. Expected number but got abc.');
        return;
      }

      assert.fail('Not throw error when empty required');
    });

    it('should be error when not required', async () => {
      const model = await createModel(fakeDriver, DEMO_SCHEMA);

      try {
        await model.create({});
      } catch(err){
        expect(err.message).to.be.eq('Value of the name field is required.');
        return;
      }

      assert.fail('Not throw error when empty required');
    });

    it('should be error when patch required to null', async () => {
      const model = await createModel(fakeDriver, DEMO_SCHEMA);
      const doc = await model.create({ name: 'foo' });

      try {
        await model.patch(doc._id, { name: null });
      } catch(err){
        expect(err.message).to.be.eq('Value of the name field is required.');
        return;
      }

      assert.fail('Not throw error when empty required');
    });

    it('should be error when create value greater than max', async () => {
      const model = await createModel(fakeDriver, DEMO_SCHEMA);

      try {
        await model.create({
          name: 'foo',
          age: 11
        });
      } catch(err){
        expect(err.message).to.be.eq('At the age field: Wrong data. 11 is greater than 10.');
        return;
      }

      assert.fail('not trigger');
    });

    it('should be error when patch value greater than max', async () => {
      const model = await createModel(fakeDriver, DEMO_SCHEMA);

      const doc = await model.create({
        name: 'foo',
        age: 5
      });

      try {
        await model.patch(doc._id, { age: 11 });
        assert.fail('not trigger');
      } catch(err){
        expect(err.message).to.be.eq('At the age field: Wrong data. 11 is greater than 10.');
      }

      // $inc
      const res = await model.patch(doc._id, { $inc: { age: 6 } });
      expect(res).to.be.eq(0);
    });

    it('should be error when create value smaller than min', async () => {
      const model = await createModel(fakeDriver, DEMO_SCHEMA);

      try {
        await model.create({
          name: 'foo',
          age: 0
        });
      } catch(err){
        expect(err.message).to.be.eq('At the age field: Wrong data. 0 is lower than 1.');
        return;
      }

      assert.fail('not trigger');
    });

    it('should be error when patch value smaller than min', async () => {
      const model = await createModel(fakeDriver, DEMO_SCHEMA);

      const doc = await model.create({
        name: 'foo',
        age: 5
      });

      try {
        await model.patch(doc._id, { age: 0 });
        assert.fail('not trigger');
      } catch(err){
        expect(err.message).to.be.eq('At the age field: Wrong data. 0 is lower than 1.');
      }

      // $inc
      const res = await model.patch(doc._id, { $inc: { age: -5 } });
      expect(res).to.be.eq(0);
    });
  });

  describe('FS test', () => {
    it('should be create', async () => {
      const model = await createModel(fakeDriver, FS_SCHEMA);
  
      const doc = await model.create({
        name: 'xin-chao.txt'
      });
  
      expect(doc).to.has.property('_id');
      expect(doc).to.has.property('name', 'xin-chao.txt');
    });
  });

  describe('Default function test', () => {
    it('should not dupplicated slug', async () => {
      const model = await createModel(fakeDriver, DEMO_SCHEMA);
  
      const doc = await model.create({
        name: 'This is a quéstion'
      });

      expect(doc).to.has.property('slug', 'this-is-a-question');

      const doc2 = await model.create({
        name: 'This is a quéstion'
      });

      expect(doc2).to.has.property('slug', 'this-is-a-question-1');

      const doc3 = await model.create({
        name: 'This is a quéstion'
      });

      expect(doc3).to.has.property('slug', 'this-is-a-question-2');
    }); 
  });
});