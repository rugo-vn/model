# Rugo Model

_Middleware Service_

Rugo Drivers for contact with drivers.

## Overview

This module is a service created by `@rugo-vn/service`.

A data connection layer for driver service:

- Select driver in schema.
- Provide more actions based on driver's actions.
- Prevent bulk change.
- Easy to use.
- Simple ACL.
- Cache schema.
- Extended schema types.
- Wrap result.

## Settings

It does not have any settings.

## Common

### Globals

- `schema.<modelName>`

### Input Args

- All common actions require `name` of schema.
- Set `acl` to `true` to enable access control list.

### Schema

Using schema as driver but it has some additions:

- `_driver`: Driver name, choose driver to handle deeper action.
- `_acls`: Access controls list, which item is the action name. It's public by default, but when `args` contains `acl=true`, it will prevent user to do the model action.

We have some extended types:

**`relation` -> `string`**

- `ref` reference model name

<!-- - `shortText` -> `string`
- `richText` -> `string`
- `codeText` -> `string`
- `json` -> `object` or `array` -->

### Response

Wrap driver`s response with [JSON:API](https://jsonapi.org/). It means, the raw communication between service should nested, with first layer related by service, and the second layer contain data info.

In error response of api service later, it should merge two layer.

_In local:_

```js
{
  data: /* driver response */,
  meta: {
    /* some meta data */
  }
}
```

_In raw communication:_

```js
{
  /* on success */
  data: {
    data: /* driver response */,
    meta: {
      /* some meta data */
    },
  },
  /* or on error */
  data: {
    errors: [],
  },
  errors: []
}
```

## Actions

**As same as driver with little changes**

### `find`

Find list of doc by `query` and other controls. 

Arguments:

- `query` (type: `object`) query to filter doc.
- `limit` (type: `number`) limit document returned. `10` by default. Using `limit=-1` to unlimited.
- `sort` (type: `object`) sort by field. (Ex: `sort: { 'nameAsc': 1, 'nameDesc': -1 }`).
- `skip` (type: `number`) skip amount of doc.
- **`{number} page`** skip to page.

Return: 

- `{number} data` amount of doc filtered by query.
- **`{object} meta`** pagination info.
  - **`{number} meta.limit`** page size, limit size.
  - **`{number} meta.total`** total of doc.
  - **`{number} meta.skip`** skipped docs.
  - **`{number} meta.page`** current page (started by `1`).
  - **`{number} meta.npage`** number of pages, total pages.

### `get`

Get a doc

Arguments:

- **`{string} id`** doc id.

Return: 

- **`{doc} data`** result doc.


### `count`

Count by `query`.

Arguments:

- `query` (type: `object`) query to filter doc.
- `limit` (type: `number`) limit document returned.
- `sort` (type: `object`) sort by field. (Ex: `sort: { 'nameAsc': 1, 'nameDesc': -1 }`).
- `skip` (type: `number`) skip amount of doc.

Return: 

- `{number} data` amount of doc filtered by query.

### `create`

Create a new doc.

Arguments:

- `data` (type: `object`) data to create new doc.

Return: 

- `{doc} data` created doc.

### `update`

Change a doc

Arguments:

- **`{string} id`** doc id.
- `set` (type: `object`) set value to some field.
- `unset` (type: `object`) unset value from some field.
- `inc` (type: `object`) increase value from some field.

Return: 

- **`{doc} data`** updated doc.

### `remove`

Arguments:

- **`{string} id`** doc id.

Return: 

- **`{doc} data`** removed doc.

<br />

**New actions**

### `register`

Register schema to later use.

Arguments: 

- `{object} schema` Schema to registered.

Return:

- `{boolean}` always `true` if success.

## License

MIT