import express from "express";
import {
  DocumentController,
  upload,
} from "../../controller/documentController";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = express.Router();

// Upload a document with metadata
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  DocumentController.uploadDocument
);

// Get a specific document by ID
router.get("/:id", authMiddleware, DocumentController.getDocumentById);

// Get all documents
router.get("/", authMiddleware, DocumentController.getAllDocuments);

// Update a document's main attributes (only accessible to Owner or Admin)
router.put("/:id", authMiddleware, DocumentController.updateDocument);

// Delete a document by ID (only accessible to Owner)
router.delete("/:id", authMiddleware, DocumentController.deleteDocument);

// Update metadata of a document
router.put(
  "/metadata/:id",
  authMiddleware,
  DocumentController.updateDocumentMetadata
);

export default router;
