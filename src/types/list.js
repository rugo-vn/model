import { InvalidTypeError } from '../exceptions.js';

export const type = (_value) => {
  let value = _value;

  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch (err) {
      throw new InvalidTypeError(_value, 'list');
    }
  }

  if (typeof value !== 'object' || !Array.isArray(value)) { throw new InvalidTypeError(_value, 'list'); }

  return value;
};

export const children = (value, schemaValue, types) => {
  const typeHandler = types[schemaValue.type];
  const res = [];

  for (const subValue of value) {
    let value = typeHandler.type(subValue);

    // triggers
    for (const [triggerName, triggerValue] of Object.entries(schemaValue)) {
      if (triggerName === 'type') { continue; }

      if (typeHandler[triggerName]) {
        value = typeHandler[triggerName](value, triggerValue, types);
      }
    }

    res.push(value);
  }

  return res;
};
