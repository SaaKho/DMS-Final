import { Response } from "express";
import jwt from "jsonwebtoken";
import path from "path";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { db, documents } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Define JWT secret and expiration for download links
const DOWNLOAD_SECRET = process.env.JWT_SECRET || "carbonteq";
const LINK_EXPIRATION = process.env.LINK_EXPIRATION || "15m";

class DownloadController {
  // Generate a short-lived download link
  static generateDownloadLink = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    console.log("Inside generateDownloadLink controller"); // Debug log
    const { documentId } = req.params;

    try {
      // Fetch the document from the database
      const document = await db
        .select()
        .from(documents)
        .where(eq(documents.id, documentId))
        .execute();

      if (!document || document.length === 0) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Generate a signed token for the download link
      const token = jwt.sign({ documentId: documentId }, DOWNLOAD_SECRET, {
        expiresIn: LINK_EXPIRATION,
      });

      const downloadLink = `${req.protocol}://${req.get(
        "host"
      )}/api/downloads/${documentId}?token=${token}`;

      res.status(200).json({ downloadLink });
    } catch (error) {
      console.error("Error generating download link:", error);
      res.status(500).json({ error: "Failed to generate download link" });
    }
  };

  // Download file using the token
  static downloadFile = async (req: AuthenticatedRequest, res: Response) => {
    console.log("Inside downloadFile controller"); // Debug log
    const { documentId } = req.params;
    const { token } = req.query;

    try {
      // Verify the token
      jwt.verify(token as string, DOWNLOAD_SECRET);

      // Fetch the document metadata to get the file path
      const document = await db
        .select()
        .from(documents)
        .where(eq(documents.id, documentId))
        .execute();

      if (!document || document.length === 0) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Construct the file path
      const filePath = path.join(
        __dirname,
        "../../uploads",
        document[0].fileName
      );
      res.download(filePath, document[0].fileName);
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(403).json({ error: "Invalid or expired token" });
    }
  };
}

export default DownloadController;
