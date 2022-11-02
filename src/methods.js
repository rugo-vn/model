import { RugoException } from "@rugo-vn/service";

export const validate = async function({ doc, schema }){
  if (doc === undefined || doc === null)
    return true;

  if (!schema)
    return true;

  if (Array.isArray(doc)){
    if (schema.type !== 'array')
      throw new RugoException(`${doc} should be an array`);

    if (!schema.items)
      return true;

    for (let subDoc of doc) {
      await this.validate({ doc: subDoc, schema: schema.items });
    }

    return true;
  }

  if (typeof doc === 'object') {
    if (schema.type !== 'object' && !schema.properties)
      throw new RugoException(`${doc} should be an object`);

    for (let key in doc){
      await this.validate({ doc: doc[key], schema: (schema.properties || {})[key] });
    }

    return true;
  }

  if (schema.type === 'relation' && schema.ref) {
    await this.call(`model.get`, { id: doc, name: schema.ref });
  }

  return true;
}