import {
  GuardViolationError,
  NotFoundError,
  AlreadyExistsError,
  InvalidOperation,
  Omitt,
} from "@carbonteq/hexapp";

export class DocumentsSearchedFailed extends InvalidOperation {
  constructor() {
    super(`Document search failed`);
  }
}

export class DocumentDoesNotHaveFilename extends GuardViolationError {
  constructor() {
    super(`Document must have a file name.`);
  }
}

export class DocumentDoesNotHaveFileExtension extends GuardViolationError {
  constructor() {
    super(`Document must have a file Extension.`);
  }
}
export class DocumentDoesNotHaveFilePath extends GuardViolationError {
    constructor() {
      super(`Document must have a file Path.`);
    }
  }

export class DocumentNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Document with id: ${id} not found`);
  }
}
export class DocumentAlreadyExistsError extends AlreadyExistsError {
  constructor(id: string) {
    super(`Document with id: ${id} already Exists`);
  }
}
export class DocumentPermissionError extends InvalidOperation {
  constructor(id: string) {
    super(`Document with id: ${id} already Exists`);
  }
}

export class DocumentUpdateError extends InvalidOperation {
  constructor(name: string) {
    super(`Document: ${name} cannot be updated`);
  }
}
export class InvalidDocumentUUID extends GuardViolationError {
  constructor() {
    super(`Invalid UUID`);
  }
}

export class InvalidDocumentFilenameError extends GuardViolationError {
  constructor() {
    super(`Invalid Filename`);
  }
}
