import { IPermissionsRepository } from "../interfaces/IPermissionRepository";
import { Logger } from "../../infrastructure/logging/logger";
import { PermissionFactory } from "../factories/PermissionFactory";
import {
  PermissionDTO,
  PermissionRevokeDTO,
} from "../../application/DTOs/request/permissiondto";
import { AppResult, toSerialized } from "@carbonteq/hexapp";
import { SerializePermission } from "../entities/Permission";
import { IDocumentRepository } from "../interfaces/IDocumentRepository";
import { Result } from "@carbonteq/fp";
import { InvalidPermissionOnDocument } from "../errors/permissionError";

export interface SuccessInterface {
  success: boolean;
  message: string;
}

export class PermissionsService {
  constructor(
    private permissionsRepository: IPermissionsRepository,
    private documentRepository: IDocumentRepository,
    private logger: Logger
  ) {}

  async grantPermission(
    dto: PermissionDTO
  ): Promise<AppResult<SerializePermission>> {
    // Verify requester permissions
    const document = await this.documentRepository.fetchById(
      dto.data.documentId
    );
    const userId = dto.data.userId;

    const checkPermission = await document
      .flatMap((doc) => {
        if (doc.userId !== userId) {
          return Result.Err(new InvalidPermissionOnDocument());
        }
        return Result.Ok(doc);
      })
      .map((_) => PermissionFactory.create(dto.data))
      .flatMap((permission) => this.permissionsRepository.insert(permission));

    const view = checkPermission.map(toSerialized);
    return AppResult.fromResult(view);
  }

  async revokePermission(
    dto: PermissionRevokeDTO
  ): Promise<AppResult<SuccessInterface>> {
    // Verify requester permissions
    const document = await this.documentRepository.fetchById(
      dto.data.documentId
    );
    const userId = dto.data.userId;
    const checkPermission = await document
      .flatMap((doc) => {
        if (doc.userId !== userId) {
          return Result.Err(new InvalidPermissionOnDocument());
        }
        return Result.Ok(doc);
      })
      .flatMap((_) => this.permissionsRepository.remove(dto.data.documentId));
    const view = checkPermission.map((_) => {
      return { success: true, message: "Permission revoked successfully" };
    });
    return AppResult.fromResult(view);
  }
}
