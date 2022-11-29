export const name = 'driver.sample';

export const actions = {};

for (const name of ['find', 'count', 'create', 'update', 'remove', 'get', 'extract']) {
  actions[name] = async function (args) {
    if (name === 'count') { return 32; }

    if (name === 'find' && args.query && args.query._id !== undefined) { return [args]; }

    return args;
  };
}
