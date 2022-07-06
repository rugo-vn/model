import { InvalidTypeError } from '../exceptions.js';

export const type = (_value) => {
  let value = _value;

  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch (err) {
      throw new InvalidTypeError(_value, 'document');
    }
  }

  if (typeof value !== 'object' || Array.isArray(value)) { throw new InvalidTypeError(_value, 'document'); }

  return value;
};
