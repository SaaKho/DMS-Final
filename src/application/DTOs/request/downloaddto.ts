import { BaseDto } from "@carbonteq/hexapp";
import { z } from "zod";

export interface IDownloadLinkDTO {
  documentId: string;
  protocol: string;
  host: string;
}

export class DownloadLinkDTO extends BaseDto {
  private static readonly schema = z.object({
    documentId: z
      .string()
      .min(1, "Document ID cannot be empty")
      .uuid("Invalid document ID"),
    protocol: z.string().min(1, "Protocol cannot be empty"),
    host: z.string().min(1, "Host cannot be empty"),
  });

  private constructor(readonly data: Readonly<IDownloadLinkDTO>) {
    super();
  }

  static create(data: unknown) {
    return BaseDto.validate(DownloadLinkDTO.schema, data).map(
      (parsed) => new DownloadLinkDTO(parsed)
    );
  }
}

export interface IDownloadDTO {
  documentId: string;
  token: string;
}

export class DownloadDTO extends BaseDto {
  private static readonly schema = z.object({
    documentId: z
      .string()
      .min(1, "Document ID cannot be empty")
      .uuid("Invalid document ID"),
    token: z.string().min(1, "Token cannot be empty"),
  });

  private constructor(readonly data: Readonly<IDownloadDTO>) {
    super();
  }

  static create(data: unknown) {
    return BaseDto.validate(DownloadDTO.schema, data).map(
      (parsed) => new DownloadDTO(parsed)
    );
  }
}
