// server.ts
import { Command } from "commander";
import "newrelic";
import config from "./utils/config";
import { app } from ".";
import { bulkDownload } from "./lib/cli/bulkDownload"; 

const program = new Command();

program
  .name("Document Management System")
  .description("Bootstraps the Express server")
  .version("1.0.0");


program
  .command("start")
  .description("Start the server")
  .action(() => {
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  });

// Command for bulk downloading
program
  .command("bulk-download")
  .description("Download documents from a folder")
  .requiredOption("-f, --folder <folderId>", "Folder ID to download")
  .option("-o, --output <destination>", "Output directory", "./downloads")
  .option("-b, --batch-size <batchSize>", "Batch size for downloads", "5")
  .action(async (options) => {
    const { folder, output, batchSize } = options;
    console.log(`Starting bulk download for folder: ${folder}`);
    try {
      await bulkDownload(folder, output, parseInt(batchSize, 10));
      console.log("Bulk download completed successfully!");
    } catch (error: any) {
      console.error("Error during bulk download:", error.message);
    }
  });

program.parse(process.argv);
