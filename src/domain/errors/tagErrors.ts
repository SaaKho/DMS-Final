import {
  NotFoundError,
  AlreadyExistsError,
  GuardViolationError,
} from "@carbonteq/hexapp";

export class TagNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`TAg with id: ${id} not found`);
  }
}
export class TagAlreadyExistsError extends AlreadyExistsError {
  constructor(id: string) {
    super(`Tag with id: ${id} already Exists`);
  }
}
export class TagNameUpdateError extends GuardViolationError {
  constructor(name: string) {
    super(`Tag: ${name} cannot be empty`);
  }
}
