import { IDocumentStoreStrategy } from "../../domain/interfaces/IDocumentStoreStrategy";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export class CloudFileStore implements IDocumentStoreStrategy {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  }

  async uploadDocument(file: File): Promise<void> {
    const { data, error } = await this.supabase.storage
      .from("documents") // Make sure this matches your bucket name
      .upload(file.name, file, {
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    console.log("File uploaded:", data?.path);
  }

  async downloadDocument(fileId: string): Promise<File> {
    const { data, error } = await this.supabase.storage
      .from("documents")
      .download(fileId);

    if (error) {
      throw new Error(`Download failed: ${error.message}`);
    }

    return new File([data!], fileId);
  }

  async deleteDocument(fileId: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from("documents")
      .remove([fileId]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }
}
