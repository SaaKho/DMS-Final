import { Document } from "../../domain/entities/Document";
import { ITagRepository } from "../../domain/interfaces/ITagRepository";
import {
  db,
  tags,
  documentTags,
  documents,
} from "../../infrastructure/drizzle/schema";
import { Tag } from "../../domain/entities/Tag";
import { eq, or, inArray, sql } from "drizzle-orm";
import {
  Paginated,
  PaginationOptions,
  RepositoryResult,
  toSerialized,
  UUID,
} from "@carbonteq/hexapp";
import {
  TagNotFoundError,
  TagAlreadyExistsError,
} from "../../domain/errors/tagErrors";
import { Result } from "@carbonteq/fp";
import { toPaginated } from "../../utils/Pagination";

export class TagRepository implements ITagRepository {
  async fetchById(
    Id: string
  ): Promise<RepositoryResult<Tag, TagNotFoundError>> {
    try {
      const data = await db
        .select()
        .from(tags)
        .where(eq(tags.id, Id))
        .leftJoin(documentTags, eq(documentTags.tagId, tags.id))
        .execute();

      if (data.length === 0) {
        return Result.Err(new TagNotFoundError(Id));
      }
      const temp = data[0];
      const documentId = temp.document_tags
        ? UUID.create(temp.document_tags.documentId).unwrap()
        : null;
      const obj = {
        id: temp.tags.id,
        name: temp.tags.name,
        documentId: documentId,
        createdAt: temp.tags.createdAt,
        updatedAt: temp.tags.updatedAt,
      };

      const entity = Tag.fromSerialize(obj);
      return Result.Ok(entity);
    } catch (error) {
      return Result.Err(new TagNotFoundError(Id));
    }
  }

  async insert(
    tag: Tag
  ): Promise<RepositoryResult<Tag, TagAlreadyExistsError>> {
    try {
      const [newTag] = await db.transaction(async (trx) => {
        const data = await trx.insert(tags).values(tag.serialize()).returning();

        if (tag.documentId.isSome()) {
          await trx
            .insert(documentTags)
            .values({ documentId: tag.documentId.unwrap(), tagId: tag.id })
            .returning();
        }
        return data;
      });
      const entity = Tag.fromSerialize({
        ...newTag,
        documentId: null,
      });
      return Result.Ok(entity);
    } catch (error) {
      return Result.Err(new TagAlreadyExistsError(tag.id));
    }
  }
  async remove(
    tagId: string
  ): Promise<RepositoryResult<Tag, TagNotFoundError>> {
    try {
      const deletedTag = await db.transaction(async (trx) => {
        // Remove associated records from documentTags table
        await trx.delete(documentTags).where(eq(documentTags.tagId, tagId));

        // Remove the tag itself from the tags table
        const [deleted] = await trx
          .delete(tags)
          .where(eq(tags.id, tagId))
          .returning(); // Fetch the deleted tag's data

        if (!deleted) {
          throw new Error("Tag not found");
        }

        return deleted;
      });

      // Convert the deleted tag data into a Tag entity
      const entity = Tag.fromSerialize({
        ...deletedTag,
        documentId: null, // Ensure documentId is handled (if nullable)
      });

      return Result.Ok(entity);
    } catch (error) {
      return Result.Err(new TagNotFoundError(tagId));
    }
  }
  async update(entity: Tag): Promise<RepositoryResult<Tag, TagNotFoundError>> {
    try {
      // Prepare the data for updating
      const updateData = {
        ...entity.forUpdate(),
        documentId: entity.documentId.isSome()
          ? entity.documentId.unwrap()
          : null,
      };

      // Perform the update in the database
      const [updatedTag] = await db
        .update(tags)
        .set(updateData)
        .where(eq(tags.id, entity.id))
        .returning()
        .execute();

      // Handle the case where no tag is found to update
      if (!updatedTag) {
        return Result.Err(new TagNotFoundError(updateData.name));
      }

      // Reconstruct the entity from the updated data
      const tagEntity = Tag.fromSerialize({
        ...updatedTag,
        documentId: null, //Is this the right approach ????
      });

      return Result.Ok(tagEntity);
    } catch (error: any) {
      return Result.Err(new TagNotFoundError(entity.id));
    }
  }
  async upsertTagsAndLinkToDocument(
    tagArray: Tag[]
  ): Promise<RepositoryResult<boolean, TagNotFoundError>> {
    const serializeTags = tagArray.map(toSerialized);
    const trx = await db.transaction(async (trx) => {
      try {
        await trx
          .insert(tags)
          .values(serializeTags)
          .onConflictDoNothing()
          .execute();

        const documentTagsData = tagArray.map((tag) => ({
          documentId: tag.documentId.unwrap(),
          tagId: tag.id,
        }));

        await trx.insert(documentTags).values(documentTagsData).execute();
        return Result.Ok(true);
      } catch (error) {
        return Result.Err(
          new TagNotFoundError("Failed to upsert tags and link to document")
        );
      }
    });
    return trx;
  }

  async fetchTags(
    tagNames: string[]
  ): Promise<RepositoryResult<string[], TagNotFoundError>> {
    try {
      const tagIdsQuery = await db
        .select({ documentId: documentTags.documentId })
        .from(documentTags)
        .innerJoin(tags, eq(documentTags.tagId, tags.id))
        .where(inArray(tags.name, tagNames))
        .execute();

      const documentIds = tagIdsQuery.map((row) => row.documentId);
      return Result.Ok(documentIds);
    } catch (error) {
      return Result.Err(
        new TagNotFoundError("Failed to fetch document IDs for tags")
      );
    }
  }
  async fetchAllWithPagination(
    opts: PaginationOptions
  ): Promise<RepositoryResult<Paginated<Tag>, TagNotFoundError>> {
    const paginatedDocuments = await db
      .select()
      .from(tags)
      .leftJoin(documentTags, eq(documentTags.tagId, tags.id))
      .limit(opts.pageSize)
      .offset((opts.pageNum - 1) * opts.pageSize)
      .execute();

    // Fetch the total count of documents
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tags)
      .execute();

    const documentEntityArray = paginatedDocuments.map((data) =>
      Tag.fromSerialize({
        ...data.tags,
        documentId: data.document_tags
          ? UUID.create(data.document_tags.documentId).unwrap()
          : null,
      })
    );

    return Result.Ok(toPaginated(documentEntityArray, opts, count));
  }
  async fetchMatchingDocuments(
    tagNames: string[]
  ): Promise<RepositoryResult<Document[], TagNotFoundError>> {
    try {
      const tagIdsQuery = await db
        .select()
        .from(documentTags)
        .leftJoin(documents, eq(documentTags.tagId, tags.id))
        .where(inArray(tags.name, tagNames))
        .execute();

      if (tagIdsQuery.length === 0) {
        return Result.Ok([]);
      }

      const entities = tagIdsQuery.map((row) => {
        if (row.documents) {
          return Document.fromSerialize(row.documents);
        }
        return undefined;
      });
      const updatedEntity = entities.filter((entity) => entity !== undefined);

      return Result.Ok(updatedEntity);
    } catch (error) {
      return Result.Err(
        new TagNotFoundError("Failed to fetch document IDs for tags")
      );
    }
  }
}
