import { NotFoundError, RugoException } from '@rugo-vn/exception';
import { DEFAULT_LIMIT } from './constants.js';
import { ModelResp } from './utils.js';

const defaultAction = action => {
  const fn = async function ({ driver: driverName, ...args }) {
    if (args.id) {
      args.query ||= {};
      args.query._id = args.id;
    }
    return ModelResp(await this.call(`driver.${driverName}.${action}`, args));
  };

  Object.defineProperty(fn, 'name', {
    value: action,
    configurable: true
  });

  return fn;
};

export const find = async function ({ driver: driverName, name, query, limit, sort, skip, page, search }) {
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
  const docs = limit === 0 ? [] : await this.call(`driver.${driverName}.find`, { name, query, ...(limit === -1 ? {} : { limit }), sort, skip, search });
  const total = await this.call(`driver.${driverName}.count`, { name, query, search });

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

export const count = defaultAction('count');
export const create = defaultAction('create');

console.log(count, create);

export const get = async function ({ driver: driverName, id, name }) {
  const doc = (await this.call(`driver.${driverName}.find`, { name, query: { _id: id } }))[0];

  if (!doc) { throw new NotFoundError('Doc not found'); }

  return ModelResp(doc);
};

export const update = async function ({ driver: driverName, name, id, set, unset, inc }) {
  // try find
  await get.bind(this)({ driver: driverName, name, id });

  // update
  const no = await this.call(`driver.${driverName}.update`, { name, query: { _id: id }, set, unset, inc });

  // result
  if (!no) { throw new RugoException('Cannot update the doc'); }

  try {
    return ModelResp((await get.bind(this)({ driver: driverName, name, id })).data);
  } catch (err) {
    if (err instanceof NotFoundError) { throw new RugoException('The id of doc was changed'); }

    throw err;
  }
};

export const remove = async function ({ driver: driverName, name, id }) {
  const doc = (await get.bind(this)({ driver: driverName, name, id })).data;

  // remove
  const no = await this.call(`driver.${driverName}.remove`, { name, query: { _id: id } });

  // result
  if (!no) { throw new RugoException('Cannot remove the doc'); }

  return ModelResp(doc);
};

export const extract = defaultAction('extract');
export const compress = defaultAction('compress');
export const backup = defaultAction('backup');
export const restore = defaultAction('restore');
