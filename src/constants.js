/**
 * @global
 * @typedef {object} Schema
 * @property {string} __name - (required) Model name.
 * @property {string} __type - Model type (used in platform/model).
 */

/**
 * Model structure.
 *
 * @global
 * @typedef {object} Model
 * @property {Function} get Get document by id.
 * @property {Function} list List document by query.
 * @property {Function} create Create a new document.
 * @property {Function} patch Update existed documents.
 * @property {Function} remove Remove documents.
 */

export const FS_SCHEMA = {
  name: { type: 'text', maxlength: 255, regex: '^[\\w\\-. ]+$' },
  mime: { type: 'text', maxlength: 255, regex: '^\\w+\\/[-+.\\w]+$' },
  parent: { type: 'text' },
  data: { type: 'file' },
  size: { type: 'number' }
};

export const COLLECTION = {
  get () {},
  list () {},
  create () {},
  patch () {},
  remove () {},
  import () {},
  export () {}
};
