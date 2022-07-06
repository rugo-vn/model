import { RugoError } from './exceptions.js';
import * as _types from './types/index.js';

export const types = {
  ..._types
};

/**
 * Check value is empty or not.
 *
 * @param {*} value Value to check
 * @returns {boolean} checked result
 */
const isEmptyValue = value => value === null || value === undefined;

/**
 * Validate document by schema
 *
 * @param {Schema} schema Schema for validation.
 * @param {Document} doc Document to validate.
 * @param {boolean} patchMode Enable patch method.
 * @returns {Document} Validated document.
 */
const validate = (schema, doc, patchMode) => {
  const validatedDoc = {};

  // validate and transform data
  for (const [fieldName, fieldSchema] of Object.entries(schema)) {
    const docValue = doc[fieldName];

    // disable editable
    if (patchMode && fieldSchema.editable === false) { continue; }

    // required trigger
    if (!patchMode && fieldSchema.required && isEmptyValue(docValue) && fieldSchema.default === undefined) {
      throw new RugoError(`Value of the ${fieldName} field is required.`);
    }

    if (patchMode && fieldSchema.required && docValue === null) { throw new RugoError(`Value of the ${fieldName} field is required.`); }

    if (patchMode && fieldSchema.required && isEmptyValue(docValue)) { continue; }

    let value = docValue;

    // not null docValue
    if (!isEmptyValue(value)) {
      const typeHandler = types[fieldSchema.type];

      try {
        value = typeHandler.type(docValue);
      } catch (err) {
        err.message = `At the ${fieldName} field: ${err.message}`;
        throw err;
      }

      // triggers
      for (const [triggerName, triggerValue] of Object.entries(fieldSchema)) {
        if (triggerName === 'type') { continue; }

        if (typeHandler[triggerName]) {
          try {
            value = typeHandler[triggerName](value, triggerValue, types);
          } catch (err) {
            err.message = `At the ${fieldName} field: ${err.message}`;
            throw err;
          }
        }
      }

      // nested schema
      if (fieldSchema.schema) {
        try {
          value = validate(fieldSchema.schema, value, patchMode);
        } catch (err) {
          err.message = `At the ${fieldName} field: ${err.message}`;
          throw err;
        }
      }
    }

    // not null value
    if (!isEmptyValue(value)) {
      validatedDoc[fieldName] = value;
      continue;
    }

    // null value
    if (patchMode && value === null) {
      validatedDoc[fieldName] = value;
      continue;
    }

    // default
    if (!patchMode && isEmptyValue(value) && fieldSchema.default !== undefined) {
      validatedDoc[fieldName] = fieldSchema.default;
      continue;
    }
  }

  return validatedDoc;
};

export default validate;
