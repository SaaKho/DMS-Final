import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db, permissions } from "../drizzle/schema";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { eq, and } from "drizzle-orm";

class PermissionsController {
  // Grant Permission
  static grantPermission = async (req: AuthenticatedRequest, res: Response) => {
    const { documentId, userId, permissionType } = req.body;
    const requesterRole = req.user?.role;
    const requesterId = req.user?.id;

    try {
      // Check if the requester is an Admin or the Owner of the document
      const isOwner = await db
        .select()
        .from(permissions)
        .where(
          and(
            eq(permissions.documentId, documentId),
            eq(permissions.userId, requesterId),
            eq(permissions.permissionType, "Owner")
          )
        )
        .execute();

      if (!(requesterRole === "Admin" || isOwner.length > 0)) {
        return res
          .status(403)
          .json({ message: "Insufficient permissions to grant access" });
      }

      // Grant permission
      const newPermission = await db
        .insert(permissions)
        .values({
          id: uuidv4(),
          documentId,
          userId,
          permissionType,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
        .execute();

      res
        .status(201)
        .json({ message: "Permission granted", permission: newPermission[0] });
    } catch (error) {
      console.error("Error granting permission:", error);
      res.status(500).json({ error: "Failed to grant permission" });
    }
  };

  // Revoke Permission
  static revokePermission = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const { documentId, userId } = req.body;
    const requesterRole = req.user?.role;
    const requesterId = req.user?.id;

    try {
      const isOwner = await db
        .select()
        .from(permissions)
        .where(
          and(
            eq(permissions.documentId, documentId),
            eq(permissions.userId, requesterId),
            eq(permissions.permissionType, "Owner")
          )
        )
        .execute();

      if (!(requesterRole === "Admin" || isOwner.length > 0)) {
        return res
          .status(403)
          .json({ message: "Insufficient permissions to revoke access" });
      }

      await db
        .delete(permissions)
        .where(
          and(
            eq(permissions.documentId, documentId),
            eq(permissions.userId, userId)
          )
        )
        .execute();

      res.status(200).json({ message: "Permission revoked" });
    } catch (error) {
      console.error("Error revoking permission:", error);
      res.status(500).json({ error: "Failed to revoke permission" });
    }
  };
}

export default PermissionsController;
