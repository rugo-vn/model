import { DEFAULT_LIMIT } from '@rugo-vn/common';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { clone } from 'ramda';

export const name = 'model';

const extractSchema = (doc, controlNames) => {
  const controls = {};
  const newDoc = {};

  for (const key in doc) {
    if (controlNames.indexOf(key) !== -1) {
      controls[key] = doc[key];
      continue;
    }

    newDoc[key] = doc[key];
  }

  return [controls, newDoc];
};

export const actions = {
  async create (ctx) {
    const { params, meta } = ctx;
    const { doc } = params || {};
    const { driver, schema } = meta;

    const current = (new Date()).toISOString();
    doc.createdAt = current;
    doc.updatedAt = current;

    const validate = this.ajv.compile(schema);
    const rel = validate(doc);

    if (!rel) {
      return {
        status: 'error',
        data: validate.errors.map(item => ({
          type: `validate.${item.keyword}`,
          path: item.instancePath,
          message: item.message
        }))
      };
    }

    const newDoc = await ctx.call(`${driver}.create`, { doc });
    if (!newDoc) {
      return {
        status: 'error',
        data: [{ type: 'general', message: 'not create a new one' }]
      };
    }

    return {
      status: 'success',
      data: newDoc
    };
  },

  async find (ctx) {
    const { meta } = ctx;
    const { driver } = meta;
    const params = ctx.params || {};

    // default limit
    let { limit } = params;
    if (typeof limit === 'number') {
      if (limit === -1) { delete params.limit; }
    } else {
      limit = DEFAULT_LIMIT;
      params.limit = limit;
    }

    // pagination: start from 1
    let { page, skip } = params;
    if (limit === -1) {
      page = 1;
    } else if (limit === 0) {
      page = 0; // no pagination
    } else {
      const skipPage = Math.floor((skip || 0) / limit) + 1;
      if (page && skipPage !== page) { // page priority
        skip = (page - 1) * limit;
        params.skip = skip;
      } else {
        page = skipPage;
      }
    }

    // default skip
    skip ||= 0;
    params.skip = skip;

    // call
    const docs = await ctx.call(`${driver}.find`, params);
    const total = await ctx.call(`${driver}.count`, params);

    // over skip
    if (skip > total) {
      skip = total;
    }

    // total page
    let npage;
    if (limit === -1) {
      npage = 1;
    } else if (limit === 0) {
      npage = 0;
    } else {
      npage = Math.floor(total / limit) + (total % limit === 0 ? 0 : 1);
    }

    // over skip > page
    if (skip === total) {
      page = npage;
    }

    return {
      status: 'success',
      data: docs,
      ...(page
        ? {
            pagination: {
              total,
              limit: typeof params.limit === 'number' ? params.limit : -1,
              skip: skip || 0,
              page,
              npage
            }
          }
        : {})
    };
  },

  async get (ctx) {
    const { meta } = ctx;
    const { driver } = meta;
    const { id } = ctx.params || {};

    return {
      status: 'success',
      data: (await ctx.call(`${driver}.find`, { filters: { _id: id } }))[0] || null
    };
  },

  async patch (ctx) {
    const { meta, params } = ctx;
    const { driver, schema } = meta;
    const { id, set } = params || {};
    const filters = params.filters || {};

    // only patch 1 item
    filters._id = id;
    params.filters = filters;

    // validate set
    const nonRequiredSchema = clone(schema);
    if (nonRequiredSchema.required) { delete nonRequiredSchema.required; }
    for (let key in nonRequiredSchema.properties)
      if (nonRequiredSchema.properties[key].default !== undefined)
        delete nonRequiredSchema.properties[key].default;

    const validate = this.ajv.compile(nonRequiredSchema);
    const setClone = clone(set || {});

    const current = (new Date()).toISOString();
    setClone.updatedAt = current;

    if (!validate(setClone)) {
      return {
        status: 'error',
        data: validate.errors.map(item => ({
          type: `validate.${item.keyword}`,
          path: item.instancePath,
          message: item.message
        }))
      };
    }
    params.set = setClone;

    if (schema.properties.version)
      params.inc ||= { version: 1 };

    const no = await ctx.call(`${driver}.patch`, params);

    if (!no) { return { status: 'error', data: [{ type: 'general', message: 'not patch the document' }] }; }

    return {
      status: 'success',
      data: (await ctx.call(`${driver}.find`, { filters }))[0] || null
    };
  },

  async remove (ctx) {
    const { meta, params } = ctx;
    const { driver } = meta;
    const { id } = params || {};
    const filters = params.filters || {};

    // only patch 1 item
    filters._id = id;
    params.filters = filters;

    const doc = (await ctx.call(`${driver}.find`, { filters }))[0] || null;
    if (!doc) { return { status: 'error', data: [{ type: 'general', message: 'not remove the document' }] }; }

    const no = await ctx.call(`${driver}.remove`, { filters });
    if (!no) { return { status: 'error', data: [{ type: 'general', message: 'not remove the document' }] }; }

    return {
      status: 'success',
      data: doc
    };
  }
};

export const hooks = {
  before: {
    async all(ctx) {
      const { meta } = ctx;
      const { schema } = meta || {};

      if (!schema) { throw new Error('Schema was not defined.'); }

      const [extracted, newSchema] = extractSchema(clone(schema), ['name', 'driver', 'identities', 'timestamp', 'version']);

      if (!extracted.name) { throw new Error('Schema name was not defined.'); }
      if (!extracted.driver) { throw new Error('Schema driver was not defined.'); }

      meta.schema = newSchema;
      meta.collection = extracted.name;
      meta.driver = `driver.${extracted.driver}`;

      meta.schema.additionalProperties = false;
      if (extracted.timestamp){
        meta.schema.properties ||= {};
        meta.schema.properties.createdAt = { type: 'string' };
        meta.schema.properties.updatedAt = { type: 'string' };
      }

      if (extracted.version){
        meta.schema.properties ||= {};
        meta.schema.properties.version = { type: 'integer', default: 1 };
      }
    }
  }
};

/**
 *
 */
export async function started () {
  this.ajv = new Ajv({ removeAdditional: true, useDefaults: true });
  addFormats(this.ajv);
}
