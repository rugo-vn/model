import { clone } from "ramda";

export const DEFAULT_LIMIT = 10;

export const ModelResp = (data, meta) => ({ data, ...(meta ? { meta } : {}) });

export const parseSchema = schema => {
  if (!schema)
    return [undefined, []];

  const resultSchema = clone(schema);

  if (resultSchema.type === 'object' || resultSchema.properties) {
    const props = resultSchema.properties || {};
    const exts = {};

    for (let key in props){
      const [sch, ext] = parseSchema(props[key]);

      props[key] = sch;

      if (ext)
        exts[key] = ext;
    }

    resultSchema.properties = props;

    return [resultSchema, Object.keys(exts).length ? { type: 'object', properties: exts } : undefined]
  }

  if (resultSchema.type === 'array') {
    const [sch, ext] = parseSchema(resultSchema.items);

    if (sch){
      resultSchema.items = sch;
    } else {
      delete resultSchema.items;
    }

    return [resultSchema, ext ? { type: 'array', items: ext } : undefined];
  }

  if (['string', 'number', 'integer', 'boolean'].indexOf(resultSchema.type) === -1){
    return [{}, resultSchema];
  }

  return [resultSchema];
}