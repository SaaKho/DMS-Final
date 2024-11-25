import { IDocumentRepository } from "../../domain/interfaces/IDocumentRepository";
import { db, documents } from "../drizzle/schema";
import { Document } from "../../domain/entities/Document";
import { eq, sql } from "drizzle-orm";
import {
  Paginated,
  PaginationOptions,
  RepositoryResult,
  toSerialized,
} from "@carbonteq/hexapp";
import {
  DocumentNotFoundError,
  DocumentAlreadyExistsError,
  DocumentUpdateError,
} from "../../domain/errors/documentErrors";
import { Result } from "@carbonteq/fp";
import { toPaginated } from "../../utils/Pagination";

export class DocumentRepository implements IDocumentRepository {
  async fetchById(
    documentId: string
  ): Promise<RepositoryResult<Document, DocumentNotFoundError>> {
    try {
      const data = await db
        .select()
        .from(documents)
        .where(eq(documents.id, documentId))
        .execute();

      if (data.length === 0) {
        return Result.Err(new DocumentNotFoundError(documentId));
      }

      const entity = Document.fromSerialize({ ...data[0] });
      return Result.Ok(entity);
    } catch (error) {
      return Result.Err(new DocumentNotFoundError(documentId));
    }
  }

  async insert(
    documentData: Document
  ): Promise<RepositoryResult<Document, DocumentAlreadyExistsError>> {
    try {
      const [data] = await db
        .insert(documents)
        .values(documentData.serialize())
        .returning();

      const entity = Document.fromSerialize({ ...data });
      return Result.Ok(entity);
    } catch (error) {
      return Result.Err(new DocumentAlreadyExistsError(documentData.id));
    }
  }

  async remove(
    documentId: string
  ): Promise<RepositoryResult<Document, DocumentNotFoundError>> {
    try {
      const [deleted] = await db
        .delete(documents)
        .where(eq(documents.id, documentId))
        .returning();
      const entity = Document.fromSerialize({ ...deleted });
      return Result.Ok(entity);
    } catch (error: any) {
      return Result.Err(new DocumentNotFoundError(documentId));
    }
  }
  async update(
    entity: Document
  ): Promise<RepositoryResult<Document, DocumentUpdateError>> {
    try {
      const updateData = entity.forUpdate();
      const updatedDocument = await db
        .update(documents)
        .set(updateData)
        .where(eq(documents.id, entity.id))
        .returning()
        .execute();

      if (!updatedDocument[0]) {
        return Result.Err(new DocumentUpdateError(updateData.fileName));
      }

      const documentEntity = Document.fromSerialize({
        ...updatedDocument[0],
      });

      return Result.Ok(documentEntity); // Return success case
    } catch (error: any) {
      return Result.Err(new DocumentUpdateError(entity.id));
    }
  }
  async fetchAllWithPagination(
    opts: PaginationOptions
  ): Promise<RepositoryResult<Paginated<Document>, DocumentNotFoundError>> {
    const paginatedDocuments = await db
      .select()
      .from(documents)
      .limit(opts.pageSize)
      .offset((opts.pageNum - 1) * opts.pageSize)
      .execute();

    // Fetch the total count of documents
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .execute();

    const documentEntityArray = paginatedDocuments.map(Document.fromSerialize);

    return Result.Ok(toPaginated(documentEntityArray, opts, count));
  }
}
