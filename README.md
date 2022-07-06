# Rugo Model

Rugo Drivers for contact with drivers.

## Usage

### Create Models

**Independent**

```js
import { createModel } from 'rugo-model';

const model = createModel(driver, schema);
```

**Plugin**

```js
import ModelPlugin from 'rugo-model/plugin';

context = await ModelPlugin(context, { 
  drivers,
  schemas
});
```

## Basic Operation

```js
await model.get(id);
await model.list(query);
await model.create(doc);
await model.patch(id, doc);
await model.remove(id);
```

## Schema

```json
{
  "__name": "model-name", // aka collection name
  "__type": "driver-type", // with fs type, it auto schema
}
```

## Common Triggers

### `required`

Required field must be set when create. Default: `false`.

### `default`

Default data if field is not set when create.

**Default functions**

Basic syntax:

- `%<functionName>:<params...>%` params is separated by comma (,).

Defined functions:

- `%unislug:title%` Unique slug

### `editable`

Field can be patch or not. Default: `true`.

## Types

### Number

- `min`
- `max`

### Text

- `minLength`
- `maxLength`
- `regex`
- `trim`
- `lowercase`
- `uppercase`
- `enum`

## API

[Visit API documentation.](./docs/API.md)

## License

MIT