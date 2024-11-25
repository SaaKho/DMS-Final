// src/domain/entities/Tag.ts
import { Option } from "@carbonteq/fp";
import {
  BaseEntity,
  IEntity,
  SerializedEntity,
  SimpleSerialized,
  UUID,
  Omitt,
} from "@carbonteq/hexapp";
import { Result } from "@carbonteq/fp";
import { TagNameUpdateError } from "../errors/tagErrors";
import { z } from "zod";
import { InvalidDocumentUUID } from "../errors/documentErrors";

export interface ITag extends IEntity {
  name: string;
  documentId: Option<UUID>;
}

export type SerializeTag = SimpleSerialized<ITag, "documentId"> & {
  documentId: UUID | null;
};
export type UpdatedTagData = Pick<ITag, "name">;

const uuidSchema = z.string().uuid();

export class Tag extends BaseEntity implements ITag {
  readonly name: string;
  readonly documentId: Option<UUID>;

  constructor(data: Readonly<Omitt<SerializeTag, keyof SerializedEntity>>) {
    super();
    this.name = data.name;
    this.documentId = Option.fromNullable(data.documentId);
  }
  serialize() {
    return {
      ...super._serialize(),
      name: this.name,
      documentId: this.documentId.safeUnwrap(),
    };
  }
  static fromSerialize(data: SerializeTag) {
    const entity = new Tag({
      name: data.name,
      documentId: data.documentId,
    });
    entity._fromSerialized(data);
    return entity;
  }

  guardAgainstInvalidTagName(): Result<this, TagNameUpdateError> {
    if (this.name === "") {
      return Result.Err(new TagNameUpdateError(this.name));
    }
    return Result.Ok(this);
  }
  guardAgainstInvalidDocumentId(): Result<this, TagNameUpdateError> {
    if (this.documentId.isSome()) {
      const result = uuidSchema.safeParse(this.documentId.safeUnwrap());
      if (!result.success) {
        return Result.Err(new InvalidDocumentUUID());
      }
    }
    return Result.Ok(this);
  }

  update(data: UpdatedTagData) {
    const updatedEntity = this.guardAgainstInvalidDocumentId()
      .flatMap(() => this.guardAgainstInvalidTagName())
      .map(() => {
        return Tag.fromSerialize({
          ...this.serialize(),
          ...data,
        });
      });
    return updatedEntity;
  }

  forUpdate() {
    return {
      ...super.forUpdate(),
      name: this.name,
    } satisfies UpdatedTagData;
  }
}
