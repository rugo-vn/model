import hash from 'object-hash';
import { RugoException } from '@rugo-vn/service';
import { path } from 'ramda';

import * as actions from './actions.js';
import { AclError } from './exceptions.js';

const actionHooks = {};
for (const actionName of Object.keys(actions)) {
  actionHooks[actionName] = function ({ name: modelName, acls, acl: aclEnabled }) {
    if (!aclEnabled) { return; }

    if (acls.indexOf(actionName) !== -1) { return; }

    throw new AclError(`You do not have permission to access ${actionName} action in ${modelName} model.`);
  };
}

export const before = {
  all (args = {}) {
    const name = path(['schema', '_name'], args) || args.name;
    if (!name) { throw new RugoException(`Model name "${name}" is not defined.`); }

    const register = this.registers[name] || {};

    const schema = args.schema || register.schema;
    if (!schema) { throw new RugoException(`Cannot find schema for model "${name}"`); }

    const hashed = hash(schema);
    if (register.hashed !== hashed) {
      register.name = name;
      register.hashed = hashed;
      register.schema = schema;
      this.registers[name] = register;
    }

    const driver = schema._driver;
    if (!driver) { throw new RugoException('Model type is not defined.'); }

    args.name = name;
    args.driver = driver;
    args.acls = schema._acls || [];
    args.nextCall = (nextAddress, nextArgs) => this.call(nextAddress, { ...nextArgs, schema });
  },
  ...actionHooks
};
