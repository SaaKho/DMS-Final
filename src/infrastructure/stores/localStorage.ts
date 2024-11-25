import { IDocumentStoreStrategy } from "../../domain/interfaces/IDocumentStoreStrategy";
import * as fs from "fs/promises";
import * as path from "path";

export class LocalFileStore implements IDocumentStoreStrategy {
  private storagePath = path.resolve(__dirname, "../../../downloads"); // Adjust path as needed

  async uploadDocument(file: File): Promise<void> {
    const filePath = path.join(this.storagePath, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);
  }

  async downloadDocument(fileId: string): Promise<File> {
    const filePath = path.join(this.storagePath, fileId);
    const data = await fs.readFile(filePath);
    return new File([data], fileId); // Convert buffer to file object
  }

  async deleteDocument(fileId: string): Promise<void> {
    const filePath = path.join(this.storagePath, fileId);
    await fs.unlink(filePath);
  }
}
