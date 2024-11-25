import {
  GuardViolationError,
  NotFoundError,
  AlreadyExistsError,
  InvalidOperation,
  Omitt,
} from "@carbonteq/hexapp";


export class PermissionNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Document with id: ${id} not found`);
  }
}
export class PermissionAlreadyExistsError extends AlreadyExistsError {
  constructor(id: string) {
    super(`Document with id: ${id} already Exists`);
  }
}

export class InvalidDocumentUUID extends GuardViolationError {
  constructor() {
    super(`Invalid UUID`);
  }
}
export class InvalidPermissionOnDocument extends InvalidOperation {
  constructor() {
    super(`Invalid permission on document`);
  }
}


export class PermissionUpdateError extends InvalidOperation {
  constructor(name: string) {
    super(`Document: ${name} cannot be updated`);
  }
}