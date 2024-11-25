import { z } from "zod";
import { BaseDto } from "@carbonteq/hexapp";

export interface IPermissionDTO {
  documentId: string;
  userId: string;
  permissionType: string;
  requesterId: string;
  requesterRole: string;
}

export class PermissionDTO extends BaseDto {
  private static readonly schema = z.object({
    documentId: z.string().min(1, "Document ID cannot be empty").uuid(),
    userId: z.string().min(1, "User ID cannot be empty").uuid(),
    permissionType: z.string().min(1, "Permission Type cannot be empty"),
    requesterId: z.string().min(1, "Requester ID cannot be empty").uuid(),
    requesterRole: z.string().min(1, "Requester Role cannot be empty"),
  });
  private constructor(readonly data: Readonly<IPermissionDTO>) {
    super();
  }

  static create(data: unknown) {
    return BaseDto.validate(PermissionDTO.schema, data).map(
      (parsed) => new PermissionDTO(parsed)
    );
  }
}

export interface IPermissionRevokeDTO {
  documentId: string;
  userId: string;
  requesterId: string;
  requesterRole: string;
}

export class PermissionRevokeDTO extends BaseDto {
  private static readonly schema = z.object({
    documentId: z.string().min(1, "Document ID cannot be empty").uuid(),
    userId: z.string().min(1, "User ID cannot be empty").uuid(),
    requesterId: z.string().min(1, "Requester ID cannot be empty").uuid(),
    requesterRole: z.string().min(1, "Requester Role cannot be empty"),
  });
  private constructor(readonly data: Readonly<IPermissionRevokeDTO>) {
    super();
  }

  static create(data: unknown) {
    return BaseDto.validate(PermissionRevokeDTO.schema, data).map(
      (parsed) => new PermissionRevokeDTO(parsed)
    );
  }
}
