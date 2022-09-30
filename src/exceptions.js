import { RugoException } from '@rugo-vn/service';

export class AclError extends RugoException {
  constructor (msg) {
    super(msg);

    this.status = 403;
  }
}

export class NotFoundError extends RugoException {
  constructor (msg) {
    super(msg);

    this.status = 404;
  }
}
