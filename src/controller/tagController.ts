import { Request, Response } from "express";
import { db, tags } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid"; // Import UUID generator

class TagController {
  // Get all tags
  static getAllTags = async (req: Request, res: Response) => {
    try {
      const allTags = await db.select().from(tags).execute();
      res.status(200).json(allTags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ error: "Failed to fetch tags" });
    }
  };

  // Create a new tag
  static createTag = async (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Tag name is required" });
    }

    try {
      const newTag = await db
        .insert(tags)
        .values({
          id: uuidv4(), // Generate UUID at application level
          name,
        })
        .returning()
        .execute();
      res
        .status(201)
        .json({ message: "Tag created successfully", tag: newTag });
    } catch (error) {
      console.error("Error creating tag:", error);
      res.status(500).json({ error: "Failed to create tag" });
    }
  };

  // Update an existing tag
  static updateTag = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Tag name is required" });
    }

    try {
      const updatedTag = await db
        .update(tags)
        .set({ name })
        .where(eq(tags.id, id))
        .returning()
        .execute();

      if (updatedTag.length > 0) {
        res
          .status(200)
          .json({ message: "Tag updated successfully", tag: updatedTag });
      } else {
        res.status(404).json({ message: "Tag not found" });
      }
    } catch (error) {
      console.error("Error updating tag:", error);
      res.status(500).json({ error: "Failed to update tag" });
    }
  };

  // Delete a tag
  static deleteTag = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const deleteResult = await db
        .delete(tags)
        .where(eq(tags.id, id))
        .execute();

      if (deleteResult.rowCount && deleteResult.rowCount > 0) {
        res.status(204).send(); // Success: No Content
      } else {
        res.status(404).json({ message: "Tag not found" });
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
      res.status(500).json({ error: "Failed to delete tag" });
    }
  };
}

export default TagController;
