// controllers/DownloadController.ts
import { Request, Response } from "express";
import { DownloadService } from "../../application/services/downloadService";
import { handleResponse } from "../../utils/handleResponse";
import {
  DownloadDTO,
  DownloadLinkDTO,
} from "../../application/DTOs/request/downloaddto";
import container from "../../lib/di/bindings";
import { Inject } from "../../lib/di/inject";
import { Injectable } from "../../lib/di/injectable";

@Injectable()
class DownloadController {
  private static downloadService =
    container.resolve<DownloadService>("DownloadService");

  constructor(
    @Inject("DownloadService") private downloadService: DownloadService
  ) {}

  static async generateDownloadLink(req: Request, res: Response) {
    const generateDownloadLinkDTO = DownloadLinkDTO.create({
      documentId: req.params.documentId,
      protocol: req.protocol,
      host: req.get("host"),
    }).unwrap();

    const result =
      await DownloadController.downloadService.generateDownloadLink({
        ...generateDownloadLinkDTO,
      });

    handleResponse(result, res);
  }

  static async downloadFile(req: Request, res: Response) {
    const { documentId } = req.params;
    const { token } = req.query;

    const downloadDTO = DownloadDTO.create({
      documentId,
      token: token,
    }).unwrap();

    const result = await DownloadController.downloadService.downloadFile(
      downloadDTO
    );

    result.map((value) => {
      res.download(value);
    });

    handleResponse(result, res);
  }
}

export default DownloadController;
