// src/repositories/implementations/PermissionsRepository.ts
import { IPermissionsRepository } from "../../domain/interfaces/IPermissionRepository";
import { db, permissions } from "../../infrastructure/drizzle/schema";
import { eq } from "drizzle-orm";
import { Permission } from "../../domain/entities/Permission";
import {
  PermissionNotFoundError,
  PermissionAlreadyExistsError,
  PermissionUpdateError,
} from "../../domain/errors/permissionError";
import { RepositoryResult } from "@carbonteq/hexapp";
import { Result } from "@carbonteq/fp";

export class PermissionsRepository implements IPermissionsRepository {
  async fetchById(
    permissionId: string
  ): Promise<Result<Permission, PermissionNotFoundError>> {
    try {
      const data = await db
        .select()
        .from(permissions)
        .where(eq(permissions.id, permissionId))
        .execute();

      if (data.length === 0) {
        return Result.Err(new PermissionNotFoundError(permissionId));
      }

      const entity = Permission.fromSerialize({ ...data[0] });
      return Result.Ok(entity);
    } catch (error) {
      return Result.Err(new PermissionNotFoundError(permissionId));
    }
  }

  async insert(
    permissionData: Permission
  ): Promise<RepositoryResult<Permission, PermissionAlreadyExistsError>> {
    try {
      const [data] = await db
        .insert(permissions)
        .values(permissionData.serialize())
        .returning();

      const entity = Permission.fromSerialize({ ...data });
      return Result.Ok(entity);
    } catch (error) {
      return Result.Err(new PermissionAlreadyExistsError(permissionData.id));
    }
  }

  async remove(
    permissionId: string
  ): Promise<RepositoryResult<Permission, PermissionNotFoundError>> {
    try {
      const [deleted] = await db
        .delete(permissions)
        .where(eq(permissions.id, permissionId))
        .returning();
      const entity = Permission.fromSerialize({ ...deleted });
      return Result.Ok(entity);
    } catch (error: any) {
      return Result.Err(new PermissionNotFoundError(permissionId));
    }
  }

  async update(
    entity: Permission
  ): Promise<RepositoryResult<Permission, PermissionUpdateError>> {
    try {
      const updateData = entity.forUpdate();
      const updatedDocument = await db
        .update(permissions)
        .set(updateData)
        .where(eq(permissions.id, entity.id))
        .returning()
        .execute();

      if (!updatedDocument[0]) {
        return Result.Err(
          new PermissionUpdateError(updateData.updatedAt.toISOString())
        );
      }

      const updatedEntity = Permission.fromSerialize({
        ...updatedDocument[0],
      });

      return Result.Ok(updatedEntity); // Return success case
    } catch (error: any) {
      return Result.Err(new PermissionUpdateError(entity.id));
    }
  }
}
