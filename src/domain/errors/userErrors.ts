import {
  GuardViolationError,
  NotFoundError,
  AlreadyExistsError,
  InvalidOperation,
  Omitt,
} from "@carbonteq/hexapp";

export class UserSearchedFailed extends InvalidOperation {
  constructor() {
    super(`User search failed`);
  }
}
//make a guard for this guardAgainstInvalidUserRole
export class UserInvalidUserRole extends GuardViolationError {
  constructor() {
    super(`User must have a file name.`);
  }
}

export class IncorrectUserNameOrPassword extends InvalidOperation {
  constructor() {
    super(`Username or password dont match`);
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`User with id: ${id} not found`);
  }
}
export class UserAlreadyExistsError extends AlreadyExistsError {
  constructor(id: string) {
    super(`User with id: ${id} already Exists`);
  }
}
export class UserPermissionError extends InvalidOperation {
  constructor(id: string) {
    super(`User with id: ${id} already Exists`);
  }
}

export class UserUpdateError extends InvalidOperation {
  constructor(name: string) {
    super(`User: ${name} cannot be updated`);
  }
}
export class InvalidDocumentUUID extends GuardViolationError {
  constructor() {
    super(`Invalid UUID`);
  }
}
export class InvalidEmail extends GuardViolationError {
  constructor() {
    super(`Invalid Email`);
  }
}
