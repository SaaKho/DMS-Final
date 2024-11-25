import { Document } from "../entities/Document";
import { Omitt, SerializedEntity } from "@carbonteq/hexapp";
import { SerializeDocument } from "../entities/Document";

export class DocumentFactory {
  static create(data: Omitt<SerializeDocument, keyof SerializedEntity>) {
    const entity = new Document({
      ...data,
    });
    return entity;
  }
}
