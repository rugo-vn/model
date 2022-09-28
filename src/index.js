export const name = 'model';

export * as actions from './actions.js';
export * as hooks from './hooks.js';

export const started = async function () {
  const ls = await this.call('_broker.services');
  this.drivers = [];
  for (const service of ls) {
    if (!/^driver/.test(service.name)) { continue; }

    this.drivers.push(service.name);
  }
};
