import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import container from "../../lib/di/bindings";
import { DocumentService } from "../../application/services/documentService";
import { handleResponse } from "../../utils/handleResponse";
import {
  DeleteDocumentDTO,
  DocumentCreateDTO,
  UpdateDocumentDTO,
} from "../../application/DTOs/request/documentdto";
import { UUIDDTO } from "../../application/DTOs/request/commonDTO";
import { PaginationDTO } from "../../application/DTOs/request/paginationdto";

export class DocumentController {
  private static documentService =
    container.resolve<DocumentService>("DocumentService");

  static uploadDocument = async (req: AuthenticatedRequest, res: Response) => {
    const file = req.file;
    const userId = req.user?.id;

    if (!file) return res.status(400).json({ error: "No file uploaded" });
    const tagNames =
      typeof req.body.tags === "string"
        ? JSON.parse(req.body.tags)
        : req.body.tags;

    if (!Array.isArray(tagNames)) {
      return res.status(400).json({ error: "Tags should be an array" });
    }

    const originalName = file.originalname;
    const fileName =
      originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
    const fileExtension = originalName.split(".").pop() || "";
    const relativeFilePath = `uploads/${fileName}.${fileExtension}`;

    const documentCreateDTO = DocumentCreateDTO.create({
      fileName,
      fileExtension,
      tagNames,
      userId,
      relativeFilePath,
    }).unwrap();

    const result = await this.documentService.createDocument(documentCreateDTO);

    handleResponse(result, res, 201);
  };

  static getDocumentById = async (req: Request, res: Response) => {
    const validatedId = UUIDDTO.create(req.params.id).unwrap();
    const result = await this.documentService.getDocument(validatedId.data.id);
    handleResponse(result, res);
  };

  static updateDocument = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;

    const documentId = req.params.id;
    const { fileName, fileExtension } = req.body;

    console.log(`Request to update document ${documentId} by user ${userId}`);

    const updateDocumentDTO = UpdateDocumentDTO.create({
      documentId,
      userId,
      fileName,
      fileExtension,
    }).unwrap();

    const result = await this.documentService.updateDocument(updateDocumentDTO);

    handleResponse(result, res);
  };

  static deleteDocument = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;

    const documentId = req.params.id;

    const delteDocumentdto = DeleteDocumentDTO.create({
      documentId,
      userId,
    }).unwrap();

    const result = await this.documentService.deleteDocument(delteDocumentdto);
    handleResponse(result, res, 204);
  };

  static async getPaginatedDocuments(
    req: Request,
    res: Response
  ): Promise<void> {
    const paginationDTO = PaginationDTO.create(req.query).unwrap();

    const result = await this.documentService.getPaginatedDocuments(
      paginationDTO
    );

    handleResponse(result, res, 200);
  }
}
