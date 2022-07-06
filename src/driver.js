import { curry, curryN } from 'ramda';
import { BaseCollection } from '@rugo-vn/common';

/**
 * Get collection for data processing. Each collection is stored with one file.
 *
 * @async
 * @returns {Collection} Collection handlers.
 */
const getCollection = async () => {
  const data = [];

  return {
    ...BaseCollection,

    create: curry(BaseCollection.create)(data),
    get: curry(BaseCollection.get)(data),
    count: curry(BaseCollection.count)(data),
    list: curryN(2, BaseCollection.list)(data),
    patch: curryN(2, BaseCollection.patch)(data),
    remove: curry(BaseCollection.remove)(data)
  };
};

/**
 * Create fake model for testing.
 *
 * @returns {Driver} Driver handler.
 */
const createFakeDriver = async () => ({
  getCollection,
  async close () { }
});

export default createFakeDriver;
