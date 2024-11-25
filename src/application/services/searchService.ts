import { Logger } from "../../infrastructure/logging/logger";
import { AppResult, toSerialized } from "@carbonteq/hexapp";
import { SerializeDocument } from "../../domain/entities/Document";
import { AdvancedSearchDTO } from "../DTOs/request/documentdto";
import { Inject } from "../../lib/di/inject";
import { IDocumentRepository } from "../../domain/interfaces/IDocumentRepository";
import { ITagRepository } from "../../domain/interfaces/ITagRepository";
import { Injectable } from "../../lib/di/injectable";

@Injectable()
export class SearchService {
  constructor(
    @Inject("IDocumentRepository")
    private documentRepository: IDocumentRepository,
    @Inject("ITagRepository") private tagRepository: ITagRepository,
    @Inject("Logger") private logger: Logger
  ) {}
  async searchDocumentsByTags(
    dto: AdvancedSearchDTO
  ): Promise<AppResult<SerializeDocument[]>> {
    this.logger.log("Starting searchDocumentsByTags service...");
    this.logger.log(`Filtering by tags: ${dto.data.tagNames}`);

    // Step 1: Fetch matching tags from the database
    const tagList = await this.tagRepository.fetchTags(dto.data.tagNames);

    // Step 2: Fetch document IDs linked to these tags
    const documents = await tagList.flatMap(() => {
      return this.tagRepository.fetchMatchingDocuments(dto.data.tagNames);
    });
    const view = documents.innerMap(toSerialized);
    return AppResult.fromResult(view);
  }
}
