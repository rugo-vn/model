import { RugoError } from '@rugo-vn/service';

export class AclError extends RugoError {
  constructor (msg) {
    super(msg);

    this.status = 403;
  }
}

export class NotFoundError extends RugoError {
  constructor (msg) {
    super(msg);

    this.status = 404;
  }
}
