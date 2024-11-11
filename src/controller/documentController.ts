import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  db,
  documents,
  permissions,
  tags,
  documentTags,
} from "../drizzle/schema";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import path from "path";
import multer from "multer";
import { eq } from "drizzle-orm";

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Define your upload folder
  },
  filename: (req, file, cb) => {
    // Use the original name of the file instead of a static "file" name
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Updated getOrCreateTags function without inArray
const getOrCreateTags = async (tagNames: string[]) => {
  // Fetch all tags and filter in JavaScript
  const existingTags = await db.select().from(tags).execute();

  const existingTagNames = existingTags
    .filter((tag) => tagNames.includes(tag.name))
    .map((tag) => tag.name);

  const newTagNames = tagNames.filter(
    (name) => !existingTagNames.includes(name)
  );

  // Create new tags for any names that don’t already exist
  const newTags = await Promise.all(
    newTagNames.map(async (name) => {
      const newTag = await db
        .insert(tags)
        .values({
          id: uuidv4(),
          name,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
        .execute();
      return newTag[0];
    })
  );

  // Return combined list of existing and new tags
  return [
    ...existingTags.filter((tag) => existingTagNames.includes(tag.name)),
    ...newTags,
  ];
};

class DocumentController {
  static uploadDocument = async (req: AuthenticatedRequest, res: Response) => {
    const file = req.file;
    let { tags: tagNames } = req.body;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(403).json({ error: "User not authenticated" });
    }

    try {
      // Ensure tagNames is an array
      if (typeof tagNames === "string") {
        tagNames = JSON.parse(tagNames);
      }

      if (!Array.isArray(tagNames)) {
        return res.status(400).json({ error: "Tags should be an array" });
      }

      const fileExtension = path.extname(file.originalname).substring(1);

      // Insert document metadata into the documents table
      const newDocument = await db
        .insert(documents)
        .values({
          id: uuidv4(),
          fileName: file.filename,
          fileExtension: fileExtension,
          filepath: file.path,
          userId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
        .execute();

      const documentId = newDocument[0].id;

      // Get or create tags
      const allTags = await getOrCreateTags(tagNames);

      // Populate documentTags table to associate the document with tags
      await Promise.all(
        allTags.map(async (tag) => {
          await db
            .insert(documentTags)
            .values({
              documentId,
              tagId: tag.id,
            })
            .execute();
        })
      );

      // Set permission for the creator as "Owner"
      await db
        .insert(permissions)
        .values({
          id: uuidv4(),
          userId: userId,
          documentId: documentId,
          permissionType: "Owner",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .execute();

      res.status(201).json({
        message: "Document uploaded successfully",
        document: newDocument,
        tags: allTags,
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  };
  static getDocumentById = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    try {
      const document = await db
        .select()
        .from(documents)
        .where(eq(documents.id, id)) // Using `eq` for ID comparison
        .execute();

      if (!document.length) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.status(200).json(document[0]);
    } catch (error) {
      console.error("Error retrieving document:", error);
      res.status(500).json({ error: "Failed to retrieve document" });
    }
  };

  // Get all documents
  static getAllDocuments = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const allDocuments = await db.select().from(documents).execute();
      res.status(200).json(allDocuments);
    } catch (error) {
      console.error("Error retrieving documents:", error);
      res.status(500).json({ error: "Failed to retrieve documents" });
    }
  };

  // Update document
  static updateDocument = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { fileName, fileExtension, filepath } = req.body;

    try {
      const updatedDocument = await db
        .update(documents)
        .set({
          fileName: fileName || undefined,
          fileExtension: fileExtension || undefined,
          filepath: filepath || undefined,
          updatedAt: new Date(),
        })
        .where(eq(documents.id, id))
        .returning()
        .execute();

      if (!updatedDocument.length) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.status(200).json({
        message: "Document updated successfully",
        document: updatedDocument[0],
      });
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ error: "Failed to update document" });
    }
  };

  // Delete document
  static deleteDocument = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    try {
      const deleteResult = await db
        .delete(documents)
        .where(eq(documents.id, id)) // Using `eq` for ID comparison
        .execute();

      if (deleteResult.rowCount === 0) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  };
  static updateDocumentMetadata = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const { id } = req.params; // Document ID
    const { fileName, fileExtension, filepath } = req.body; // Metadata fields to update

    try {
      // Ensure at least one field is provided for update
      if (!fileName && !fileExtension && !filepath) {
        return res
          .status(400)
          .json({ error: "No metadata fields provided for update" });
      }

      // Log the received values
      console.log("Received values:", { fileName, fileExtension, filepath });

      // Update document metadata fields
      const updatedDocument = await db
        .update(documents)
        .set({
          fileName: fileName || undefined,
          fileExtension: fileExtension || undefined,
          filepath: filepath ? path.join("uploads", filepath) : undefined, // Dynamically set filepath
          updatedAt: new Date(),
        })
        .where(eq(documents.id, id))
        .returning()
        .execute();

      // Check if the document exists
      if (!updatedDocument.length) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.status(200).json({
        message: "Document metadata updated successfully",
        document: updatedDocument[0],
      });
    } catch (error) {
      console.error("Error updating document metadata:", error);
      res.status(500).json({ error: "Failed to update document metadata" });
    }
  };
}

export { upload, DocumentController };
