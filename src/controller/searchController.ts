import { Response } from "express";
import { db, documents, tags, documentTags } from "../drizzle/schema";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { eq, inArray, ilike, and, between } from "drizzle-orm";

class SearchController {
  static searchDocuments = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        filename,
        fileExtension,
        tags: tagNames,
        startDate,
        endDate,
      } = req.query;

      // Base query to search for documents
      let query: any = db.select().from(documents);

      // Apply filters based on query parameters

      // Filter by filename (case-insensitive match)
      if (filename) {
        query = query.where(ilike(documents.fileName, `%${filename}%`));
      }

      // Filter by file extension
      if (fileExtension) {
        query = query.where(
          eq(documents.fileExtension, fileExtension as string)
        );
      }

      // Filter by created date range
      if (startDate && endDate) {
        query = query.where(
          between(
            documents.createdAt,
            new Date(startDate as string),
            new Date(endDate as string)
          )
        );
      }

      // Filter by tags if provided
      if (tagNames) {
        const tagList = (
          typeof tagNames === "string" ? tagNames.split(",") : tagNames
        ) as string[];

        // Fetch document IDs associated with the tags
        const tagIdsQuery = await db
          .select({
            documentId: documentTags.documentId,
          })
          .from(documentTags)
          .innerJoin(tags, eq(documentTags.tagId, tags.id))
          .where(inArray(tags.name, tagList))
          .execute();

        const documentIds = tagIdsQuery.map((tag) => tag.documentId);

        query = query.where(inArray(documents.id, documentIds));
      }

      // Execute the query
      const results = await query.execute();

      res.status(200).json({ documents: results });
    } catch (error) {
      console.error("Error searching documents:", error);
      res.status(500).json({ error: "Failed to search documents" });
    }
  };
}

export default SearchController;
