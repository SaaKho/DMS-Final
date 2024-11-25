import { IUserRepository } from "../../domain/interfaces/IUserRepository";
import { db, users } from "../../infrastructure/drizzle/schema";
import { User } from "../../domain/entities/User";
import { eq, sql } from "drizzle-orm";
import { EmailVO } from "../../domain/valueObjects/Email";
import {
  Paginated,
  PaginationOptions,
  RepositoryResult,
} from "@carbonteq/hexapp";
import {
  UserAlreadyExistsError,
  UserNotFoundError,
  UserUpdateError,
} from "../../domain/errors/userErrors";
import { Result } from "@carbonteq/fp";
import { toPaginated } from "../../utils/Pagination";
import { UserRole } from "../../domain/refined/userRefined";

export class UserRepository implements IUserRepository {
  async insert(
    userData: User
  ): Promise<RepositoryResult<User, UserAlreadyExistsError>> {
    try {
      const [user] = await db
        .insert(users)
        .values({
          ...userData.serialize(), 
        })
        .returning()
        .execute();

      // Transform database response to match SerializeUser
      const entity = User.fromSerialize({
        ...user,
      });

      return Result.Ok(entity);
    } catch (error: any) {
      return Result.Err(new UserAlreadyExistsError(userData.id));
    }
  }

  async fetchById(
    userId: string
  ): Promise<RepositoryResult<User, UserNotFoundError>> {
    try {
      const data = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .execute();
      if (data.length === 0) {
        return Result.Err(new UserNotFoundError(userId));
      }
      const entity = User.fromSerialize({
        ...data[0],
      });
      return Result.Ok(entity);
    } catch (error) {
      return Result.Err(new UserNotFoundError(userId));
    }
  }

  async fetchByUsername(
    username: string
  ): Promise<RepositoryResult<User, UserNotFoundError>> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .execute();

      const entity = User.fromSerialize({
        ...result[0],
      });

      return Result.Ok(entity);
    } catch (error) {
      return Result.Err(new UserNotFoundError(username));
    }
  }
  async fetchByEmail(
    email: string
  ): Promise<RepositoryResult<User, UserNotFoundError>> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .execute();

      const entity = User.fromSerialize({
        ...result[0],
      });

      return Result.Ok(entity);
    } catch (error) {
      return Result.Err(new UserNotFoundError(email));
    }
  }
  async remove(id: string): Promise<RepositoryResult<User, UserNotFoundError>> {
    try {
      const [deleted] = await db
        .delete(users)
        .where(eq(users.id, id))
        .returning();
      const entity = User.fromSerialize({
        ...deleted,
      });
      return Result.Ok(entity);
    } catch (error) {
      return Result.Err(new UserNotFoundError(id));
    }
  }
  async update(entity: User): Promise<RepositoryResult<User, UserUpdateError>> {
    try {
      const updatedData = entity.forupdate();
      const updatedUser = await db
        .update(users)
        .set({
          ...updatedData,
        })
        .where(eq(users.id, entity.id))
        .returning()
        .execute();

      if (!updatedUser[0]) {
        return Result.Err(new UserUpdateError(updatedData.username));
      }

      const documentEntity = User.fromSerialize({
        ...updatedUser[0],
      });

      return Result.Ok(documentEntity); // Return success case
    } catch (error) {
      return Result.Err(new UserUpdateError(entity.id));
    }
  }
  async fetchAllWithPagination(
    opts: PaginationOptions
  ): Promise<RepositoryResult<Paginated<User>, UserNotFoundError>> {
    const paginatedDocuments = await db
      .select()
      .from(users)
      .limit(opts.pageSize)
      .offset((opts.pageNum - 1) * opts.pageSize)
      .execute();

    // Fetch the total count of documents
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .execute();

    const documentEntityArray = paginatedDocuments.map((data) =>
      User.fromSerialize({
        ...data,
      })
    );

    return Result.Ok(toPaginated(documentEntityArray, opts, count));
  }
}
