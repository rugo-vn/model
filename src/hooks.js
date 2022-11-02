import { RugoException } from '@rugo-vn/service';

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
    const name = args.name;
    if (!name) { throw new RugoException(`Model name "${name}" is not defined.`); }

    const schema = this.globals[`schema.${name}`];
    if (!schema) { throw new RugoException(`Cannot find schema for model "${name}"`); }

    const driver = schema._driver;
    if (!driver) { throw new RugoException('Model type is not defined.'); }

    args.name = name;
    args.driver = driver;
    args.acls = schema._acls || [];
    args.nextCall = (nextAddress, nextArgs) => this.call(nextAddress, { ...nextArgs, schema });
  },
  ...actionHooks
};
