import { InvalidTypeError, TriggerError } from '../exceptions.js';

/**
 * Validate number type.
 *
 * @param {*} _value Value to validate
 * @returns {number} Validated value
 */
export const type = (_value) => {
  let value = _value;

  if (typeof value === 'string') { value = parseFloat(value); }

  if (typeof value !== 'number' || isNaN(value)) { throw new InvalidTypeError(_value, 'number'); }

  return value;
};

/**
 * Validate min of value.
 *
 * @param {*} value Value to validate
 * @param {object} schemaValue Schema value to validate
 * @returns {number} Validated value.
 */
export const min = (value, schemaValue) => {
  if (value < schemaValue) { throw new TriggerError('lower than', value, schemaValue); }
  return value;
};

/**
 * Validate max of value.
 *
 * @param {*} value Value to validate
 * @param {object} schemaValue Schema value to validate
 * @returns {number} Validated value.
 */
export const max = (value, schemaValue) => {
  if (value > schemaValue) { throw new TriggerError('greater than', value, schemaValue); }
  return value;
};
