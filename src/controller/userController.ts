import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { registerSchema, loginSchema } from "../validation/authvalidation";
import { v4 as uuidv4 } from "uuid"; // Import UUID generator

// Enum for roles
enum UserRole {
  User = "User",
  Admin = "Admin",
}

// Helper function to hash passwords
const hashPassword = async (password: string) => bcrypt.hash(password, 10);

// Helper function to generate JWT token
const generateToken = (user: {
  id: string;
  username: string;
  role: string;
}) => {
  const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// UserController class with static async arrow functions
class UserController {
  static registerUser = async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.errors });
    }
    const { username, email, password } = parsed.data;

    try {
      const hashedPassword = await hashPassword(password);
      const newUser = await db
        .insert(users)
        .values({
          id: uuidv4(), // Generate UUID at application level
          username,
          email,
          password: hashedPassword,
          role: UserRole.User,
        })
        .returning();

      res
        .status(201)
        .json({ message: "User registered successfully", user: newUser });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  };

  static registerAdmin = async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.errors });
    }
    const { username, email, password } = parsed.data;

    try {
      const hashedPassword = await hashPassword(password);
      const newAdmin = await db
        .insert(users)
        .values({
          id: uuidv4(), // Generate UUID at application level
          username,
          email,
          password: hashedPassword,
          role: UserRole.Admin,
        })
        .returning();

      res
        .status(201)
        .json({ message: "Admin registered successfully", user: newAdmin });
    } catch (error) {
      console.error("Error registering admin:", error);
      res.status(500).json({ error: "Failed to register admin" });
    }
  };

  static loginUser = async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.errors });
    }
    const { username, password } = parsed.data;

    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .execute();
      const user = result[0];

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      const token = generateToken({
        id: user.id,
        username: user.username,
        role: user.role,
      });
      res.json({ token });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Failed to log in" });
    }
  };

  static updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { username, email, password, role } = req.body;

    try {
      const hashedPassword = password
        ? await hashPassword(password)
        : undefined;
      const updatedUser = await db
        .update(users)
        .set({
          username: username || undefined,
          email: email || undefined,
          password: hashedPassword || undefined,
          role: role ? role.toLowerCase() : undefined,
        })
        .where(eq(users.id, id))
        .returning()
        .execute();

      if (updatedUser.length > 0) {
        res.status(200).json(updatedUser);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  };

  static deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const deleteResult = await db
        .delete(users)
        .where(eq(users.id, id))
        .execute();

      if (deleteResult.rowCount && deleteResult.rowCount > 0) {
        res.status(204).send(); // Success: No Content
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  };
}

export default UserController;
