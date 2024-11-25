import { Document } from "../entities/Document";
import {
  BaseRepository,
  Paginated,
  PaginationOptions,
  RepositoryResult,
} from "@carbonteq/hexapp";
import {
  DocumentNotFoundError,
  DocumentAlreadyExistsError,
  DocumentPermissionError,
} from "../errors/documentErrors";

export interface IDocumentRepository extends BaseRepository<Document> {
  fetchById(
    documentId: string
  ): Promise<RepositoryResult<Document, DocumentNotFoundError>>;
  insert(
    documentData: Document
  ): Promise<RepositoryResult<Document, DocumentAlreadyExistsError>>;

  update(
    entity: Document
  ): Promise<RepositoryResult<Document, DocumentNotFoundError>>;

  remove(
    documentId: string
  ): Promise<RepositoryResult<Document, DocumentAlreadyExistsError>>;

  fetchAllWithPagination(
    opts: PaginationOptions
  ): Promise<RepositoryResult<Paginated<Document>, DocumentNotFoundError>>;
}
