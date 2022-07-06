import { FileData } from '@rugo-vn/common';
import { InvalidTypeError } from '../exceptions.js';

/**
 * Validate number type.
 *
 * @param {*} _value Value to validate
 * @param value
 * @returns {number} Validated value
 */
export const type = (value) => {
  if (value.constructor !== FileData) { throw new InvalidTypeError(value, 'file'); }

  return value;
};
