import { z } from "zod";
import { BaseDto } from "@carbonteq/hexapp";
import { UserRole } from "../../../domain/refined/userRefined";

export interface IUserRegisterDTO {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export class UserRegisterDTO extends BaseDto {
  private static readonly schema = z.object({
    username: z.string().min(1, "Username cannot be empty"),
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password cannot be empty"),
    role: UserRole,
  });

  private constructor(readonly data: Readonly<IUserRegisterDTO>) {
    super();
  }

  static create(data: unknown) {
    return BaseDto.validate(UserRegisterDTO.schema, data).map(
      (parsed) => new UserRegisterDTO(parsed)
    );
  }
}

export interface ILoginDTO {
  username: string;
  password: string;
}

export class LoginDTO extends BaseDto {
  private static readonly schema = z.object({
    username: z.string().min(1, "Username cannot be empty"),
    password: z.string().min(1, "Password cannot be empty"),
  });

  private constructor(readonly data: Readonly<ILoginDTO>) {
    super();
  }

  static create(data: unknown) {
    return BaseDto.validate(LoginDTO.schema, data).map(
      (parsed) => new LoginDTO(parsed)
    );
  }
}

export interface IDeleteUSerDTO{
  id:string,
}

export class DeleteUserDTO extends BaseDto{
  private static readonly schema = z.object({
    id: z.string().min(1, "Id cannot be empty"),
  });

  private constructor(readonly data: Readonly<IDeleteUSerDTO>) {
    super();
  }

  static create(data: unknown) {
    return BaseDto.validate(DeleteUserDTO.schema, data).map(
      (parsed) => new DeleteUserDTO(parsed)
    );
  }
}

export interface IUpdateUserDTO {
  id:string,
  username: string;
  password: string;
  role: UserRole;
}

export class UpdateUserDTO extends BaseDto {
  private static readonly schema = z.object({
    id: z.string().min(1, "Id cannot be empty"),
    username: z.string().min(1, "Username cannot be empty").optional(),
    password: z.string().min(1, "Password cannot be empty").optional(),
    role: UserRole,
  });

  private constructor(readonly data: Readonly<Partial<IUpdateUserDTO>& {
    id:string
  }>) {
    super();
  }

  static create(data: unknown) {
    return BaseDto.validate(UpdateUserDTO.schema, data).map(
      (parsed) => new UpdateUserDTO(parsed)
    );
  }
}
