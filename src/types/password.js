import bcrypt from 'bcryptjs';
import { PASSWORD_SALT } from '@rugo-vn/common';
import { InvalidTypeError } from '../exceptions.js';

/**
 * Validate password type.
 *
 * @param {*} value Value to validate
 * @returns {string} Validated value (hashed)
 */
export const type = (value) => {
  if (typeof value !== 'string') { throw new InvalidTypeError(value, 'password'); }

  return bcrypt.hashSync(value, PASSWORD_SALT);
};
