import { User } from "../entities/User";
import { Document } from "../entities/Document";
import { Result } from "@carbonteq/fp";
import { InvalidPermissionOnDocument } from "../errors/permissionError";


export class PermissionDomainService {
  checkPermission(
    user: User,
    document: Document
  ): Result<boolean, InvalidPermissionOnDocument> {
    if (document.userId !== user.id) {
      return Result.Err(new InvalidPermissionOnDocument());
    }
    return Result.Ok(true);
  }
}
