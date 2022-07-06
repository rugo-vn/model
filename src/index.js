import { clone, curry } from 'ramda';
import { compile } from 'fundefstr';
import slugify from 'slugify';

import { COLLECTION, FS_SCHEMA } from './constants.js';
import validate from './validate.js';

const generateDefault = compile({
  slugify ([value, ...params]) {
    return [slugify(value || '', { strict: true, lower: true, locale: 'vi' }), -1, ...params];
  },

  counter ([value, counter, ...params]) {
    return [value, counter + 1, ...params];
  },

  async unique ([value, counter, collection, field], next, back) {
    const query = {};
    query[field] = value + (counter === 0 ? '' : `-${counter}`);

    const { total } = await doList(collection, query);

    if (total === 0) { next([query[field]]); } else { back([value, counter, collection, field]); }
  },

  async unislug ([value, collection, field]) {
    return await generateDefault('slugify,counter,unique:value,collection,field', { value, collection, field });
  }
});

/**
 * Extract specific name from object.
 *
 * @param {object} doc Origin object.
 * @param {Array.<string>} controlNames List of name needed.
 * @returns {object} contain `controls` property and `doc` property.
 */
const extractControls = (doc, controlNames) => {
  const controls = {};
  const newDoc = {};

  for (const key in doc) {
    if (controlNames.indexOf(key) !== -1) {
      controls[key] = doc[key];
      continue;
    }

    newDoc[key] = doc[key];
  }

  return {
    controls,
    doc: newDoc
  };
};

/**
 * List documents.
 *
 * @async
 * @param {Collection} collection Collection want to handle.
 * @param {object} query Match exact query object. May be contain controls with $ prefix: $limit, $sort, $skip
 * @returns {object} List result, contains: total (total of query result), skip (no skip documents), limit (no limit documents), data (list document).
 */
const doList = async (collection, query) => {
  const { doc: doQuery, controls } = extractControls(query, [
    '$sort',
    '$limit',
    '$skip'
  ]);

  controls.$limit = parseInt(controls.$limit);
  if (isNaN(controls.$limit)) { controls.$limit = 10; }

  for (const name in controls.$sort) {
    controls.$sort[name] = parseInt(controls.$sort[name]);
    if (isNaN(controls.$sort[name])) { delete controls.$sort[name]; }
  }

  controls.$skip = parseInt(controls.$skip);
  if (isNaN(controls.$skip)) { controls.$skip = 0; }

  return await collection.list(doQuery, controls);
};

/**
 * Get a document by id.
 *
 * @async
 * @param {Collection} collection Collection want to handle.
 * @param {*} id Id of document need to find.
 * @returns {Document} Document needed.
 */
const doGet = async (collection, id) => {
  return await collection.get(id);
};

/**
 * Create a new document
 *
 * @async
 * @param {Collection} collection Collection want to handle. Required.
 * @param {Schema} _schema Shape of data. Required.
 * @param {Document} doc A document to be created. Required.
 * @returns {Document} A created document.
 */
const doCreate = async (collection, _schema, doc) => {
  const schema = clone(_schema);

  // default generator
  for (const key in schema) {
    if (typeof schema[key] === 'object' && schema[key] && schema[key].default) {
      const rel = /^%(.*?)%$/.exec(schema[key].default);

      if (!rel) { continue; }

      schema[key].default = (await generateDefault(`${rel[1]},__collection,__field`, {
        ...doc,
        __collection: collection,
        __field: key
      }))[0];
    }
  }

  // validate
  const insertedDoc = validate(schema, doc);

  // addition info
  const now = (new Date()).toISOString();
  insertedDoc.createdAt = now;
  insertedDoc.updatedAt = now;
  insertedDoc.version = 1;

  // exec
  return await collection.create(insertedDoc);
};

/**
 * Patch documents.
 *
 * @async
 * @param {Collection} collection Collection want to handle. Required.
 * @param {Schema} schema Shape of data. Required.
 * @param {string} id Id of document need to find.
 * @param {object} doc Data to patch, maybe contain controls with $ prefix: $inc.
 * @returns {number} No of changed documents.
 */
const doPatch = async (collection, schema, id, doc) => {
  // extract
  const { doc: extractedDoc, controls } = extractControls(doc, ['$inc']);

  // validate
  const patchedDoc = validate(schema, extractedDoc, true);

  // unset field
  const unset = {};
  for (const fieldName in patchedDoc) {
    if (patchedDoc[fieldName] !== null) { continue; }

    unset[fieldName] = 1;
    delete patchedDoc[fieldName];
  }
  if (Object.keys(unset).length) { controls.$unset = unset; }

  // addition info
  const now = (new Date()).toISOString();
  patchedDoc.updatedAt = now;
  controls.$inc = controls.$inc || {};
  controls.$inc.version = 1;
  controls.$set = patchedDoc;

  // query trigger
  const query = { _id: collection.id(id) };
  for (const [fieldName, fieldSchema] of Object.entries(schema)) {
    // $inc control
    const incAmount = controls.$inc[fieldName];
    if (incAmount) {
      // min trigger
      if (incAmount < 0 && fieldSchema.min !== undefined) {
        query[fieldName] = { $gte: fieldSchema.min - incAmount };
      }

      // max trigger
      if (incAmount > 0 && fieldSchema.max !== undefined) {
        query[fieldName] = { $lte: fieldSchema.max - incAmount };
      }
    }
  }

  return await collection.patch(query, controls);
};

/**
 * Remove documents
 *
 * @async
 * @param {Collection} collection Collection want to handle. Required.
 * @param {string} id Id of document need to find.
 * @returns {number} No removed document.
 */
const doRemove = async (collection, id) => {
  return await collection.remove({ _id: collection.id(id) });
};

/**
 * Create a model with schema validation and transformation.
 *
 * @async
 * @param {Driver} driver Driver for handle.
 * @param {Schema} rawSchema Schema for validation and transformation.
 * @returns {Model} Return model.
 */
const createModel = async (driver, rawSchema) => {
  // extract schema
  const schemaConfig = {};
  const originSchema = {};

  for (const key in rawSchema) {
    if (key[0] === '_' && key[1] === '_') {
      schemaConfig[key.substring(2)] = rawSchema[key];
    } else {
      originSchema[key] = rawSchema[key];
    }
  }

  // create collection
  const { name, type } = schemaConfig;
  const schema = type === 'fs' ? { ...FS_SCHEMA, ...originSchema } : originSchema;
  const collection = await driver.getCollection(name);

  return {
    ...COLLECTION,

    list: curry(doList)(collection),
    get: curry(doGet)(collection),
    create: curry(doCreate)(collection, schema),
    patch: curry(doPatch)(collection, schema),
    remove: curry(doRemove)(collection),

    import: collection.import,
    export: collection.export
  };
};
export default createModel;
