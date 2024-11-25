// services/documentService.ts
import { IDocumentRepository } from "../../domain/interfaces/IDocumentRepository";
import { ITagRepository } from "../../domain/interfaces/ITagRepository";
import { IPermissionsRepository } from "../../domain//interfaces/IPermissionRepository";
import { Logger } from "../../infrastructure/logging/logger";
import { DocumentFactory } from "../../domain/factories/DocumentFactory";
import { PermissionFactory } from "../../domain/factories/PermissionFactory";
import { SerializeDocument } from "../../domain/entities/Document";
import { Injectable } from "../../lib/di/injectable";
import { Inject } from "../../lib/di/inject";
import {
  DeleteDocumentDTO,
  DocumentCreateDTO,
  UpdateDocumentDTO,
} from "../DTOs/request/documentdto";
import {
  AppResult,
  Paginated,
  PaginationOptions,
  toSerialized,
} from "@carbonteq/hexapp";
import { TagFactory } from "../../domain/factories/TagFactory";
import { Result } from "@carbonteq/fp";
import { InvalidPermissionOnDocument } from "../../domain/errors/permissionError";
import { InvalidDocumentFilenameError } from "../../domain/errors/documentErrors";
import { PaginationDTO } from "../DTOs/request/paginationdto";

export interface SuccessInterface {
  success: boolean;
  message: string;
}

export interface FileDetails {
  filePath: string;
  fileExtension: string;
}

@Injectable()
export class DocumentService {
  constructor(
    @Inject("IDocumentRepository")
    private documentRepository: IDocumentRepository,
    @Inject("ITagRepository") private tagRepository: ITagRepository,
    @Inject("IPermissionsRepository")
    private permissionsRepository: IPermissionsRepository,
    @Inject("Logger") private logger: Logger
  ) {}
  // Get Document
  async getDocument(documentId: string): Promise<AppResult<SerializeDocument>> {
    this.logger.log(`Fetching document with ID: ${documentId}`);

    const documentEntity = await this.documentRepository.fetchById(documentId);
    const view = documentEntity.map(toSerialized);

    return AppResult.fromResult(view);
  }

  createFilePath(filename: string): FileDetails {
    const originalName = filename;
    const fileName =
      originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
    const fileExtension = originalName.split(".").pop() || "";
    const filePath = `uploads/${fileName}.${fileExtension}`;
    return { filePath, fileExtension };
  }

  async createDocument(
    dto: DocumentCreateDTO
  ): Promise<AppResult<SerializeDocument>> {
    this.logger.log("Creating document");
    const { filePath, fileExtension } = this.createFilePath(dto.data.fileName);
    const fileName = dto.data.fileName;

    // Step 1: Create a Document entity using DocumentFactory
    const document = DocumentFactory.create({
      ...dto.data,
      filePath,
      fileExtension,
      fileName,
    });

    // Step 2: Add the Document entity to the repository
    const documentResult = await this.documentRepository.insert(document);

    // Step 3: Retrieve or create tags
    const tagEntityArray = dto.data.tagNames.map((tagName) => {
      return TagFactory.create({ name: tagName, documentId: document.id });
    });

    const tagsResult = await documentResult.flatMap(() =>
      this.tagRepository.upsertTagsAndLinkToDocument(tagEntityArray)
    );

    // Step 5: Assign ownership permission to the user

    const ownershipPermission = await Result.sequence(
      documentResult,
      tagsResult
    )
      .map(([document, _]) => {
        return PermissionFactory.create({
          documentId: document.id,
          userId: document.userId,
          permissionType: "Owner", //TODO need to make string Enums Owner Editor Viewer
        });
      })
      .flatMap((permission) => this.permissionsRepository.insert(permission));

    const view = Result.sequence(ownershipPermission, documentResult).map(
      ([_, document]) => document.serialize()
    );
    return AppResult.fromResult(view);
  }

  async updateDocument(
    dto: UpdateDocumentDTO
  ): Promise<AppResult<SerializeDocument>> {
    // Fetch the existing document from the repository
    const documentResult = await this.documentRepository.fetchById(
      dto.data.documentId
    );

    //Check Permission on the Document
    const updatedDocument = await documentResult
      .flatMap((doc) => {
        if (doc.userId !== dto.data.userId) {
          return Result.Err(new InvalidPermissionOnDocument());
        }
        return Result.Ok(doc);
      })
      .flatMap(() => {
        if (dto.data.fileName) {
          return Result.Ok(this.createFilePath(dto.data.fileName));
        }
        return Result.Err(new InvalidDocumentFilenameError());
      })
      .map((filedetails) => {
        return DocumentFactory.create({
          ...dto.data,
          filePath: filedetails.filePath,
          fileExtension: filedetails.fileExtension,
          fileName: dto.data.fileName!,
        });
      })
      .flatMap((document) => this.documentRepository.update(document));
    const view = updatedDocument.map(toSerialized);
    return AppResult.fromResult(view);
  }

  async deleteDocument(
    dto: DeleteDocumentDTO
  ): Promise<AppResult<SuccessInterface>> {
    const document = await this.documentRepository.fetchById(
      dto.data.documentId
    );
    const userId = dto.data.userId;
    const checkPermission = await document
      .flatMap((doc) => {
        if (doc.userId !== userId) {
          return Result.Err(new InvalidPermissionOnDocument());
        }
        return Result.Ok(doc);
      })
      .flatMap((_) => this.documentRepository.remove(dto.data.documentId));
    const view = checkPermission.map((_) => {
      return { success: true, message: "Document deleted successfully" };
    });
    return AppResult.fromResult(view);
  }

  async getPaginatedDocuments({
    pageNum,
    pageSize,
  }: PaginationDTO): Promise<AppResult<Paginated<SerializeDocument>>> {
    const opts = PaginationOptions.create({ pageNum, pageSize }).unwrap();
    const documentResult = await this.documentRepository.fetchAllWithPagination(
      opts
    );
    const data = documentResult.map(
      (paginatedDocument) => paginatedDocument.data
    );
    const view = Result.sequence(data, documentResult).map(
      ([data, pagination]) => {
        return {
          ...pagination,
          data: data.map(toSerialized),
        };
      }
    );

    return AppResult.fromResult(view);
  }
}
