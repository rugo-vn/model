import Mime from 'mime';
import { FsId, RugoException } from '@rugo-vn/service';

export const validate = async function ({ doc, schema }) {
  if (doc === undefined || doc === null) { return true; }

  if (!schema) { return true; }

  if (Array.isArray(doc)) {
    if (schema.type !== 'array') { throw new RugoException(`${doc} should be an array`); }

    if (!schema.items) { return true; }

    for (const subDoc of doc) {
      await this.validate({ doc: subDoc, schema: schema.items });
    }

    return true;
  }

  if (typeof doc === 'object') {
    if (schema.type === 'json') { return true; }

    if (schema.type !== 'object' && !schema.properties) { throw new RugoException(`${doc} should be an object`); }

    for (const key in doc) {
      await this.validate({ doc: doc[key], schema: (schema.properties || {})[key] });
    }

    return true;
  }

  if (schema.type === 'relation' && schema.ref) {
    await this.call('model.get', { id: doc, name: schema.ref });
  }

  if (schema.type === 'file' && schema.ref) {
    let id = doc;

    if (schema.prefix && id.indexOf(schema.prefix) !== 0) {
      throw new RugoException(`${doc} should has ${schema.prefix} as prefix`);
    }

    if (schema.prefix) { id = id.substring(schema.prefix.length); }

    if (schema.mimes && schema.mimes.indexOf(Mime.getType(id)) === -1) {
      throw new RugoException('Do not allowed mime type.');
    }

    await this.call('model.get', { id: FsId.fromPath(id), name: schema.ref });
  }

  return true;
};
