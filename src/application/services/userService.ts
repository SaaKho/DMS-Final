import { IUserRepository } from "../../domain/interfaces/IUserRepository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Logger } from "../../infrastructure/logging/logger";
import { SerializeUser, User } from "../../domain/entities/User";
import { UserFactory } from "../../domain/factories/UserFactory";
import config from "./../../utils/config";
import { Injectable } from "../../lib/di/injectable";
import { Inject } from "../../lib/di/inject";
import {
  AppResult,
  Paginated,
  PaginationOptions,
  toSerialized,
} from "@carbonteq/hexapp";
import {
  DeleteUserDTO,
  LoginDTO,
  UpdateUserDTO,
  UserRegisterDTO,
} from "../DTOs/request/userDto";
import { PaginationDTO } from "../DTOs/request/paginationdto";
import { Result } from "@carbonteq/fp";
import { IncorrectUserNameOrPassword } from "../../domain/errors/userErrors";

export type JWTToken = { token: string };

const JWT_SECRET = config.jwtSecret;
export interface SuccessInterface {
  success: boolean;
  message: string;
}

@Injectable()
export class UserService {
  constructor(
    @Inject("IUserRepository") private userRepository: IUserRepository,
    @Inject("Logger") private logger: Logger
  ) {}

  async registerUser(dto: UserRegisterDTO): Promise<AppResult<SerializeUser>> {
    this.logger.log("Registering user");

    // Create User entity
    const userResult = UserFactory.create({
      ...dto.data,
      password: await bcrypt.hash(dto.data.password, 10),
    });

    //Persist the entity to the repository
    const registeredUser = await this.userRepository.insert(userResult);

    const view = registeredUser.map(toSerialized);

    return AppResult.fromResult(view);
  }

  async loginUser(dto: LoginDTO): Promise<AppResult<JWTToken>> {
    this.logger.log(`Logging in user with name ${dto.data.username} `);

    const { username, password } = dto.data;
    this.logger.log(`Logging in user with name ${dto.data.username} `);

    const userResult = await this.userRepository.fetchByUsername(username);
    this.logger.log(`Logging in user with name ${dto.data.username} `);

    const loginResult = await userResult.flatMap(async (user) => {
      const loggedUser = await bcrypt.compare(password, user.password);
      if (!loggedUser) {
        return Result.Err(new IncorrectUserNameOrPassword());
      }
      return Result.Ok(user);
    });
    this.logger.log(`Logging in user with name ${dto.data.username} `);
    const tokenResult = loginResult.map((user) => {
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      return token;
    });
    const view = tokenResult.map((token) => {
      return { token };
    });

    return AppResult.fromResult(view);
  }

  async getPaginatedUsers({
    pageNum,
    pageSize,
  }: PaginationDTO): Promise<AppResult<Paginated<SerializeUser>>> {
    const opts = PaginationOptions.create({ pageNum, pageSize }).unwrap();
    const userResult = await this.userRepository.fetchAllWithPagination(opts);
    const data = userResult.map((paginatedDocument) => paginatedDocument.data);
    const view = Result.sequence(data, userResult).map(([data, pagination]) => {
      return {
        ...pagination,
        data: data.map(toSerialized),
      };
    });
    return AppResult.fromResult(view);
  }

  async updateUser(dto: UpdateUserDTO): Promise<AppResult<SerializeUser>> {
    const userResult = await this.userRepository.fetchById(dto.data.id);

    const updatedUser = await userResult.flatMap(async (user) => {
      const updatedUser = user.update({
        ...dto.data,
        password: dto.data.password
          ? await bcrypt.hash(dto.data.password, 10)
          : user.password,
      });
      return updatedUser;
    });

    const updatedResult = await updatedUser.flatMap((user) =>
      this.userRepository.update(user)
    );

    const view = updatedResult.map(toSerialized);
    return AppResult.fromResult(view);
  }

  async deleteUser(dto: DeleteUserDTO): Promise<AppResult<SuccessInterface>> {
    const user = await this.userRepository.fetchById(dto.data.id);
    const deleteResult = await user.flatMap((_) => {
      return this.userRepository.remove(dto.data.id);
    });
    const view = deleteResult.map((_) => {
      return { success: true, message: "User deleted successfully" };
    });
    return AppResult.fromResult(view);
  }

  private generateToken(user: User): string {
    const JWT_SECRET = config.jwtSecret;
    return jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
  }
}
