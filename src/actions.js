import { RugoException } from '@rugo-vn/service';
import { NotFoundError } from './exceptions.js';
import { DEFAULT_LIMIT, ModelResp } from './utils.js';

const defaultAction = action => async function ({ driver: driverName, nextCall, ...args }) {
  return ModelResp(await nextCall(`driver.${driverName}.${action}`, args));
};

export const find = async function ({ driver: driverName, query, limit, sort, skip, page, search, nextCall }) {
  // default limit
  limit = parseInt(limit);
  if (isNaN(limit)) {
    limit = DEFAULT_LIMIT;
  }

  // pagination: start from 1
  page = parseInt(page);
  skip = parseInt(skip);
  if (limit === -1) {
    page = 1;
  } else if (limit === 0) {
    page = 0; // no pagination
  } else {
    const skipPage = Math.floor((skip || 0) / limit) + 1;
    if (!isNaN(page) && skipPage !== page) { // page priority
      skip = (page - 1) * limit;
    } else {
      page = skipPage;
    }
  }

  // default skip
  skip ||= 0;

  // call
  const docs = limit === 0 ? [] : await nextCall(`driver.${driverName}.find`, { query, ...(limit === -1 ? {} : { limit }), sort, skip, search });
  const total = await nextCall(`driver.${driverName}.count`, { query, search });

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

  return ModelResp(docs, {
    limit,
    total,
    skip,
    page,
    npage
  });
};

export const count = async function ({ driver: driverName, query, nextCall }) {
  return ModelResp(await nextCall(`driver.${driverName}.count`, { query }));
};

export const create = async function ({ driver: driverName, data: doc, schema, extSchema }) {
  if (extSchema) {
    await this.validate({ doc, schema: extSchema });
  }

  const resp = await this.call(`driver.${driverName}.create`, { data: doc, schema });

  return ModelResp(resp);
};

export const get = async function ({ driver: driverName, id, nextCall }) {
  const doc = (await nextCall(`driver.${driverName}.find`, { query: { _id: id } }))[0];

  if (!doc) { throw new NotFoundError('Doc not found'); }

  return ModelResp(doc);
};

export const update = async function ({ driver: driverName, id, set, unset, inc, extSchema, nextCall }) {
  if (extSchema) {
    await this.validate({ doc: set, schema: extSchema });
  }

  // try find
  await get.bind(this)({ driver: driverName, id, nextCall });

  // update
  const no = await nextCall(`driver.${driverName}.update`, { query: { _id: id }, set, unset, inc });

  // result
  if (!no) { throw new RugoException('Cannot update the doc'); }

  try {
    return ModelResp((await get.bind(this)({ driver: driverName, id, nextCall })).data);
  } catch (err) {
    if (err instanceof NotFoundError) { throw new RugoException('The id of doc was changed'); }

    throw err;
  }
};

export const remove = async function ({ driver: driverName, id, nextCall }) {
  const doc = (await get.bind(this)({ driver: driverName, id, nextCall })).data;

  // remove
  const no = await nextCall(`driver.${driverName}.remove`, { query: { _id: id } });

  // result
  if (!no) { throw new RugoException('Cannot remove the doc'); }

  return ModelResp(doc);
};

export const extract = defaultAction('extract');

export const compress = defaultAction('compress');

export const restore = defaultAction('restore');
