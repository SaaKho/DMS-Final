import { Omitt, SerializedEntity } from "@carbonteq/hexapp";
import { SerializeTag } from "../entities/Tag";
import { Tag } from "../entities/Tag";

export class TagFactory {
  static create(data: Omitt<SerializeTag, keyof SerializedEntity>) {
    const entity = new Tag({
      ...data,
    });
    return entity;
  }
}
