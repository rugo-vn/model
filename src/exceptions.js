export class RugoError extends Error {
  constructor (message) {
    super(message);

    this.status = 400;
  }
}

export class InvalidTypeError extends RugoError {
  constructor (value, type) {
    super(`Invalid type. Expected ${type} but got ${value}.`);
  }
}

export class TriggerError extends RugoError {
  constructor (type, value, expect) {
    super(`Wrong data. ${value} is ${type} ${expect}.`);
  }
}
