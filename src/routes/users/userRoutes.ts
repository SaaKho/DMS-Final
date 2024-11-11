import express from "express";
import { authMiddleware, authorizeRole } from "../../middleware/authMiddleware";
import UserController from "../../controller/userController";

const router = express.Router();

// Route for user registration (for regular users only)
router.post("/register", UserController.registerUser);

// Route for admin registration (admin-only route)
router.post(
  "/register-admin",
  authMiddleware,
  authorizeRole("Admin"),
  UserController.registerAdmin
);

// Route for user login
router.post("/login", UserController.loginUser);

// Route to update a user (accessible only to Admin)
router.put(
  "/update/:id",
  authMiddleware,
  authorizeRole("Admin"),
  UserController.updateUser
);

// Route to delete a user (accessible only to Admin)
router.delete(
  "/deleteUser/:id",
  authMiddleware,
  authorizeRole("Admin"),
  UserController.deleteUser
);

export default router;
