import {
  IEntity,
  SimpleSerialized,
  Omitt,
  SerializedEntity,
  AggregateRoot,
} from "@carbonteq/hexapp";
import { Result } from "@carbonteq/fp";
import {
  DocumentDoesNotHaveFilename,
  DocumentDoesNotHaveFileExtension,
  DocumentDoesNotHaveFilePath,
} from "../errors/documentErrors";

export interface IDocument extends IEntity {
  fileName: string;
  fileExtension: string;
  filePath: string;
  userId: string;
}

export type SerializeDocument = SimpleSerialized<IDocument>;
export type UpdatedDocumentData = Pick<
  IDocument,
  "fileName" | "filePath" | "fileExtension"
>;

export class Document extends AggregateRoot implements IDocument {
  readonly fileName: string;
  readonly fileExtension: string;
  readonly filePath: string;
  readonly userId: string;

  constructor(
    data: Readonly<Omitt<SerializeDocument, keyof SerializedEntity>>
  ) {
    super();
    this.fileName = data.fileName;
    this.fileExtension = data.fileExtension;
    this.filePath = data.filePath;
    this.userId = data.userId;
  }

  //jab database main rakhwaana hai menaing when you get request from client and you want to prepare it for the entity to sabe to database
  //also when we need to show data of the document to a view (lets say a FE)
  serialize() {
    return {
      ...super._serialize(),
      fileName: this.fileName,
      fileExtension: this.fileExtension,
      filePath: this.filePath,
      userId: this.userId,
    };
  }
  //fromSerialzise is static and when you get from the database and you want to convert it to the entity
  //you receive data in serialize form and you want to convert it to the entity
  static fromSerialize(data: SerializeDocument) {
    const entity = new Document({
      fileName: data.fileName,
      fileExtension: data.fileExtension,
      filePath: data.filePath,
      userId: data.userId,
    });
    entity._fromSerialized(data);
    return entity;
  }
  guardAgainstInvalidFileName(): Result<this, DocumentDoesNotHaveFilename> {
    if (this.fileName === "") {
      return Result.Err(new DocumentDoesNotHaveFilename());
    }
    return Result.Ok(this);
  }
  guardAgainstInvalidFileExtension(): Result<
    this,
    DocumentDoesNotHaveFileExtension
  > {
    if (this.fileName === "") {
      return Result.Err(new DocumentDoesNotHaveFileExtension());
    }
    return Result.Ok(this);
  }
  guardAgainstInvalidFilePath(): Result<this, DocumentDoesNotHaveFilePath> {
    if (this.filePath === "") {
      return Result.Err(new DocumentDoesNotHaveFilePath());
    }
    return Result.Ok(this);
  }

  forUpdate() {
    return {
      ...super.forUpdate(),
      fileName: this.fileName,
      fileExtension: this.fileExtension,
      filePath: this.filePath,
    } satisfies UpdatedDocumentData;
  }

  update(data: Partial<UpdatedDocumentData>) {
    const updatedEntity = this.guardAgainstInvalidFileName()
      .flatMap(() => this.guardAgainstInvalidFileExtension())
      .flatMap(() => this.guardAgainstInvalidFilePath())
      .map(() => {
        return Document.fromSerialize({
          ...this.serialize(),
          ...data,
        });
      });
    return updatedEntity;
  }
}
