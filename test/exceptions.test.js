/* eslint-disable */

import { expect } from "chai";
import { InvalidTypeError, TriggerError } from "../src/exceptions.js";

describe('Exceptions test', () => {
  it('should not have status', async () => {
    const error = new Error('something wrong');
    expect(error).to.not.has.property('status');
  });

  it('should be invalid type', async () => {
    const error = new InvalidTypeError(123, 'text');
    expect(error).to.has.property('status', 400);
    expect(error).to.has.property('message', 'Invalid type. Expected text but got 123.');
  });

  it('should be trigger', async () => {
    const error = new TriggerError('lower than', 12, 20);
    expect(error).to.has.property('status', 400);
    expect(error).to.has.property('message', 'Wrong data. 12 is lower than 20.');
  });
});