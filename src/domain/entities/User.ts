import { UserRole } from "../../domain/refined/userRefined";
import { EmailVO } from "../valueObjects/Email";
import {
  IEntity,
  SimpleSerialized,
  Omitt,
  SerializedEntity,
  AggregateRoot,
  InvalidEmail,
  BaseEntity,
} from "@carbonteq/hexapp";
import { Result } from "@carbonteq/fp";
import {
  IncorrectUserNameOrPassword,
  UserInvalidUserRole,
} from "../errors/userErrors";

export interface IUser extends IEntity {
  username: string;
  email: EmailVO;
  role: UserRole;
  password: string;
}

export type SerializeUser = SimpleSerialized<IUser, "email"> & {
  email: string;
};

export type UpdatedUserData = Pick<IUser, "username" | "password" | "role">;

export class User extends BaseEntity implements IUser {
  readonly username: string;
  readonly email: EmailVO;
  readonly password: string;
  readonly role: UserRole;

  constructor(data: Readonly<Omitt<SerializeUser, keyof SerializedEntity>>) {
    super();
    const emailResult = EmailVO.create(data.email).unwrap();
    this.username = data.username;
    this.email = emailResult;
    this.password = data.password;
    this.role = data.role;
  }
  serialize() {
    return {
      ...super._serialize(),
      username: this.username,
      password: this.password,
      email: this.email.serialize(),
      role: this.role,
    };
  }

  static fromSerialize(data: SerializeUser) {
    const emailResult = EmailVO.create(data.email).unwrap();

    const entity = new User({
      username: data.username,
      password: data.password,
      email: emailResult.email,
      role: data.role,
    });
    entity._fromSerialized(data);
    return entity;
  }

  update(data: Partial<UpdatedUserData>) {
    const updatedEntity = this.guardAgainstInvalidUserName()
      .flatMap(() => this.guardAgainstInvalidUserRole())
      .map(() => {
        return User.fromSerialize({
          ...this.serialize(),
          ...data,
          password: this.password,
          email: this.email.serialize(),
        });
      });

    return updatedEntity;
  }

  forupdate() {
    return {
      ...super.forUpdate(),
      username: this.username,
      password: this.password,
      role: this.role,
    } satisfies UpdatedUserData;
  }

  guardAgainstInvalidUserName(): Result<this, IncorrectUserNameOrPassword> {
    if (this.username === "") {
      return Result.Err(new IncorrectUserNameOrPassword());
    }
    return Result.Ok(this);
  }

  guardAgainstInvalidUserRole(): Result<this, UserInvalidUserRole> {
    if (!Object.values(UserRole).includes(this.role)) {
      return Result.Err(new UserInvalidUserRole());
    }
    return Result.Ok(this);
  }
}
