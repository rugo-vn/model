import { clone } from 'ramda';
import { DEFAULT_TYPE_SCHEMAS } from './constants.js';

export const DEFAULT_LIMIT = 10;

export const ModelResp = (data, meta) => ({ data, ...(meta ? { meta } : {}) });

export const parseSchema = (schema, root = true) => {
  if (!schema) { return [undefined, []]; }

  const resultSchema = clone(schema);

  if (root || resultSchema.type === 'object' || resultSchema.properties) {
    const props = resultSchema.properties || {};
    const exts = {};

    for (const key in props) {
      const [sch, ext] = parseSchema(props[key], false);

      props[key] = sch;

      if (ext) { exts[key] = ext; }
    }

    resultSchema.properties = props;

    return [resultSchema, Object.keys(exts).length ? { type: 'object', properties: exts } : undefined];
  }

  if (resultSchema.type === 'array') {
    const [sch, ext] = parseSchema(resultSchema.items, false);

    if (sch) {
      resultSchema.items = sch;
    } else {
      delete resultSchema.items;
    }

    return [resultSchema, ext ? { type: 'array', items: ext } : undefined];
  }

  if (['string', 'number', 'integer', 'boolean'].indexOf(resultSchema.type) === -1) {
    return [DEFAULT_TYPE_SCHEMAS[resultSchema.type] || {}, resultSchema];
  }

  return [resultSchema];
};
