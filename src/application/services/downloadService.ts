// services/DownloadService.ts
import jwt from "jsonwebtoken";
import { Logger } from "../../infrastructure/logging/logger";
import config from "./../../utils/config";
import { Injectable } from "../../lib/di/injectable";
import { Inject } from "../../lib/di/inject";
import { IDocumentRepository } from "../../domain/interfaces/IDocumentRepository";
import { DownloadDTO, DownloadLinkDTO } from "../DTOs/request/downloaddto";
import { AppResult } from "@carbonteq/hexapp";
import { DocumentService } from "./documentService";

const DOWNLOAD_SECRET = config.jwtSecret;
const LINK_EXPIRATION = config.linkExpiration;

@Injectable()
export class DownloadService {
  constructor(
    @Inject("IDocumentRepository")
    private documentRepository: IDocumentRepository,
    @Inject("DocumentService") private documentService: DocumentService,
    @Inject("Logger") private logger: Logger
  ) {}
  async generateDownloadLink(dto: DownloadLinkDTO): Promise<AppResult<string>> {
    this.logger.log(
      `Generating download link for document: ${dto.data.documentId}`
    );

    const { documentId, protocol, host } = dto.data;

    // Explicitly type documentResult to help TypeScript infer the type
    const documentResult = await this.documentRepository.fetchById(documentId);

    const view = documentResult.map(() => {
      const token = jwt.sign({ documentId }, DOWNLOAD_SECRET, {
        expiresIn: LINK_EXPIRATION,
      });
      const downloadLink = `${protocol}://${host}/api/downloads/${documentId}?token=${token}`;
      return downloadLink;
    });
    return AppResult.fromResult(view);
  }

  async downloadFile(dto: DownloadDTO): Promise<AppResult<string>> {
    const { documentId, token } = dto.data;

    jwt.verify(token, DOWNLOAD_SECRET);
    this.logger.log("Token verified for document download");

    const documentResult = await this.documentRepository.fetchById(documentId);

    const filepath = documentResult.map((doc) => {
      const filedetails = this.documentService.createFilePath(doc.fileName);
      return filedetails.filePath;
    });
    return AppResult.fromResult(filepath);
  }
}
