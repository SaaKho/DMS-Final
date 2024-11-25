// permissionRoutes.ts
import express from "express";
import { AuthMiddleware } from "../middleware/authMiddleware";
import { PermissionsController } from "../controller/permissionController";

const router = express.Router();

// Grant permission (Admin or Owner only)
router.post("/grant", AuthMiddleware, PermissionsController.grantPermission);

// Revoke permission (Admin or Owner only)
router.post("/revoke", AuthMiddleware, PermissionsController.revokePermission);

export default router;
