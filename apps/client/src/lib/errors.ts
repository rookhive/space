export class HTTPError extends Error {
  #status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'HTTPError';
    this.#status = status;
  }

  get status() {
    return this.#status;
  }
}

export class UnauthenticatedError extends HTTPError {
  constructor(message = 'Unauthenticated') {
    super(message, 401);
    this.name = 'UnauthenticatedError';
  }
}

export class AccessDeniedError extends HTTPError {
  constructor(message = 'Access denied') {
    super(message, 403);
    this.name = 'AccessDeniedError';
  }
}

export class InternalServerError extends HTTPError {
  constructor(message = 'Internal server error') {
    super(message, 500);
    this.name = 'InternalServerError';
  }
}
