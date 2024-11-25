import fs from "fs-extra";
import path from "path";

const TEST_FOLDER_BASE = path.resolve(__dirname, "../../test-data/folder1");
const DEFAULT_DESTINATION = path.resolve(__dirname, "../../downloads");

export async function bulkDownload(
  folderPath = TEST_FOLDER_BASE,
  destination = DEFAULT_DESTINATION,
  batchSize = 5
) {
  try {
    console.log(`Source folder: ${folderPath}`);
    console.log(`Destination folder: ${destination}`);

    // Ensure the source folder exists
    if (!(await fs.pathExists(folderPath))) {
      console.error(`Source folder does not exist: ${folderPath}`);
      return;
    }

    // Read files from the source folder
    const files = await fs.readdir(folderPath);
    if (!files || files.length === 0) {
      console.log("No documents found in the specified folder.");
      return;
    }

    // Ensure the destination directory exists
    await fs.ensureDir(destination);

    console.log(`Found ${files.length} files. Starting bulk download...`);

    // Map each file to its copy operation
    const copyPromises = files.map((file) =>
      copyFile(file, folderPath, destination)
    );

    // Process files in batches
    for (let i = 0; i < copyPromises.length; i += batchSize) {
      console.log(
        `Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(
          copyPromises.length / batchSize
        )}`
      );
      await Promise.all(copyPromises.slice(i, i + batchSize));
    }

    console.log("All downloads completed successfully!");
  } catch (error: any) {
    console.error(`Error during bulk download: ${error.message}`);
    throw error;
  }
}

// Function to copy a file from the source folder to the destination
async function copyFile(
  fileName: string,
  sourceFolder: string,
  destinationFolder: string
) {
  try {
    const sourcePath = path.join(sourceFolder, fileName);
    const destinationPath = path.join(destinationFolder, fileName);

    console.log(`Copying file: ${fileName}`);
    await fs.copy(sourcePath, destinationPath);
    console.log(`Copied: ${fileName}`);
  } catch (error: any) {
    console.error(`Failed to copy file: ${fileName}`, error.message);
    throw error;
  }
}

// Call the function if this script is executed directly
if (require.main === module) {
  bulkDownload();
}
