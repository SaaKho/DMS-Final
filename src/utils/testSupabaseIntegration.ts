// testSupabaseIntegration.ts
import fs from "fs";
import path from "path";
import { CloudFileStore } from "../infrastructure/stores/cloudFileStorage";
import dotenv from "dotenv";

dotenv.config();

async function testSupabaseIntegration() {
  const fileStore = new CloudFileStore();

  // Path to a test file on your local system
  const testFilePath = path.join(__dirname, "test-file.txt");

  // Ensure a test file exists for upload
  if (!fs.existsSync(testFilePath)) {
    fs.writeFileSync(testFilePath, "This is a test file for Supabase upload.");
  }

  try {
    // Test the uploadDocument method
    const testFile = new File([fs.readFileSync(testFilePath)], "new-file.txt", {
      type: "text/plain",
    });
    console.log("Uploading document...");
    await fileStore.uploadDocument(testFile);

    console.log("File uploaded successfully.");

    // Test the downloadDocument method
    console.log("Downloading document...");
    const downloadedFile = await fileStore.downloadDocument("new-file.txt");
    const downloadPath = path.join(__dirname, "downloaded-test-file.txt");

    // Save the downloaded file locally for verification
    const arrayBuffer = await downloadedFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(downloadPath, buffer);
    console.log("File downloaded successfully:", downloadPath);
  } catch (error: any) {
    console.error("An error occurred:", error.message);
  }
}

testSupabaseIntegration();
