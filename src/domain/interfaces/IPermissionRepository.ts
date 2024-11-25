// src/repositories/interfaces/IPermissionsRepository.ts
import { Permission } from "../entities/Permission";
import { BaseRepository, RepositoryResult } from "@carbonteq/hexapp";
import {
  PermissionNotFoundError,
  PermissionAlreadyExistsError,
} from "../errors/permissionError";

export interface IPermissionsRepository extends BaseRepository<Permission> {
  fetchById(
    permissionId: string
  ): Promise<RepositoryResult<Permission, PermissionNotFoundError>>;
  insert(
    entity: Permission
  ): Promise<RepositoryResult<Permission, PermissionAlreadyExistsError>>;

  update(
    entity: Permission
  ): Promise<RepositoryResult<Permission, PermissionNotFoundError>>;

  remove(
    documentId: string
  ): Promise<RepositoryResult<Permission, PermissionAlreadyExistsError>>;
}
