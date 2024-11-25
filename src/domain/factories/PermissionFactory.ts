import { Permission } from "../entities/Permission";
import { Omitt, SerializedEntity } from "@carbonteq/hexapp";
import { SerializePermission } from "../entities/Permission";

export class PermissionFactory {
  static create(data: Omitt<SerializePermission, keyof SerializedEntity>) {
    const entity = new Permission({
      ...data,
    });
    return entity;
  }
}
