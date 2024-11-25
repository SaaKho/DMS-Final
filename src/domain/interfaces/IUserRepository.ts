import { User } from "../entities/User";
import {
  BaseRepository,
  Paginated,
  PaginationOptions,
  RepositoryResult,
} from "@carbonteq/hexapp";
import {
  UserNotFoundError,
  UserAlreadyExistsError,
} from "../errors/userErrors";

export interface IUserRepository extends BaseRepository<User> {
  insert(user: User): Promise<RepositoryResult<User, UserAlreadyExistsError>>;

  fetchById(userId: string): Promise<RepositoryResult<User, UserNotFoundError>>;

  fetchByUsername(
    username: string
  ): Promise<RepositoryResult<User, UserNotFoundError>>;

  fetchByEmail(
    email: string
  ): Promise<RepositoryResult<User, UserNotFoundError>>;

  update(entity: User): Promise<RepositoryResult<User, UserNotFoundError>>;

  remove(id: string): Promise<RepositoryResult<User, UserAlreadyExistsError>>;

  fetchAllWithPagination(
    opts: PaginationOptions
  ): Promise<RepositoryResult<Paginated<User>, UserNotFoundError>>;
}
