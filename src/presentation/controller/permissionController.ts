import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { PermissionsService } from "../../domain/services/permissionService";
import {
  PermissionDTO,
  PermissionRevokeDTO,
} from "../../application/DTOs/request/permissiondto";
import { handleResponse } from "../../utils/handleResponse";
import container from "../../lib/di/bindings";
import { Injectable } from "../../lib/di/injectable";

@Injectable()
export class PermissionsController {
  private static permissionService =
    container.resolve<PermissionsService>("PermissionService");

  static async grantPermission(req: AuthenticatedRequest, res: Response) {
    const { documentId, userId, permissionType } = req.body;
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;

    const permissionDTO = PermissionDTO.create({
      ...req.body,
      requesterId,
      requesterRole,
    }).unwrap();

    const result =
      await PermissionsController.permissionService.grantPermission(
        permissionDTO
      );
    handleResponse(result, res, 201);
  }

  static async revokePermission(req: AuthenticatedRequest, res: Response) {
    const { documentId, userId } = req.body;
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;

    const revokePermission = PermissionRevokeDTO.create({
      ...req.body,
      requesterId,
      requesterRole,
    }).unwrap();

    const result =
      await PermissionsController.permissionService.revokePermission(
        revokePermission
      );
    handleResponse(result, res, 200);
  }
}
