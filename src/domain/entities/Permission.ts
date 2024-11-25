import {
  IEntity,
  SimpleSerialized,
  Omitt,
  SerializedEntity,
  AggregateRoot,
} from "@carbonteq/hexapp";
import { Result } from "@carbonteq/fp";

export interface IPermission extends IEntity {
  documentId: string;
  userId: string;
  permissionType: string;
}
export type SerializePermission = SimpleSerialized<IPermission>;
export type UpdatedPermissionData = Pick<
  IPermission,
  "documentId" | "userId" | "permissionType"
>;

export class Permission extends AggregateRoot implements IPermission {
  readonly documentId: string;
  readonly userId: string;
  readonly permissionType: string;

  constructor(
    data: Readonly<Omitt<SerializePermission, keyof SerializedEntity>>
  ) {
    super();
    this.documentId = data.documentId;
    this.userId = data.userId;
    this.permissionType = data.permissionType;
  }
  serialize() {
    return {
      ...super._serialize(),
      documentId: this.documentId,
      userId: this.userId,
      permissionType: this.permissionType,
    };
  }
  static fromSerialize(data: SerializePermission) {
    const entity = new Permission({
      documentId: data.documentId,
      userId: data.userId,
      permissionType: data.permissionType,
    });
    entity._fromSerialized(data);
    return entity;
  }

  // guardAgainstInvalidDocumentId(): Result<this, Error> {
  //   if (!Guard.isValidUUID(this.documentId)) {
  //     return Result.Err(new Error("Invalid documentId"));
  //   }
  //   return Result.Ok(this);
  // }
  // guardAgainstInvalidUserId(): Result<this, Error> {
  //   if (!Guard.isValidUUID(this.userId)) {
  //     return Result.Err(new Error("Invalid userId"));
  //   }
  //   return Result.Ok(this);
  // }
  guardAgainstInvalidPermissionType(): Result<this, Error> {
    if (this.permissionType === "") {
      return Result.Err(new Error("Invalid permissionType"));
    }
    return Result.Ok(this);
  }

  update(data: Partial<UpdatedPermissionData>) {
    const updatedEntity = this.guardAgainstInvalidPermissionType().map(() => {
      return Permission.fromSerialize({
        ...this.serialize(),
        ...data,
      });
    });
    return updatedEntity;
  }
  forUpdate() {
    return {
      ...super.forUpdate(),
      documentId: this.documentId,
      userId: this.userId,
      permissionType: this.permissionType,
    } satisfies UpdatedPermissionData;
  }
}
