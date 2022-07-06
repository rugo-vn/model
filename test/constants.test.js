/* eslint-disable */

import { COLLECTION } from "../src/constants.js";

describe('Constant test', () => {
  it('should do default collection', async () => {
    await COLLECTION.get();
    await COLLECTION.create();
    await COLLECTION.list();
    await COLLECTION.patch();
    await COLLECTION.remove();
  });
});