export interface IDocumentStoreStrategy {
  uploadDocument(file: File): Promise<void>;
  downloadDocument(fileId: string): Promise<File>;
  deleteDocument(fileId: string): Promise<void>;
}
