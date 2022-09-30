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
  all (args) {
    const name = path(['schema', '_name'], args);
    const driver = path(['schema', '_driver'], args);
    const acls = path(['schema', '_acls'], args);

    if (!name) { throw new RugoException(`Model name ${args.schema ? '_name ' : ''}is not defined.`); }
    if (!driver) { throw new RugoException('Model type is not defined.'); }

    args.name = name;
    args.driver = driver;
    args.acls = acls || [];
  },
  ...actionHooks
};
