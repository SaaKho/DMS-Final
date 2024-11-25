import { User } from "../entities/User";
import { Omitt, SerializedEntity } from "@carbonteq/hexapp";
import { SerializeUser } from "../entities/User";

export class UserFactory {
  static create(data: Omitt<SerializeUser, keyof SerializedEntity>) {
    const entity = new User({
      ...data,
    });
    return entity;
  }
}
