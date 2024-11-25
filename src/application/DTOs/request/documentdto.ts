import { z } from "zod";
import { BaseDto } from "@carbonteq/hexapp";

export interface IDocumentCreateDTO {
  fileName: string;
  userId: string;
  tagNames: string[];
}

export class DocumentCreateDTO extends BaseDto {
  private static readonly schema = z.object({
    fileName: z.string().min(1, "File name cannot be empty"),
    userId: z
      .string()
      .min(1, "User ID cannot be empty")
      .uuid("Invalid user ID"),
    tagNames: z.array(z.string()).min(1, "At least one tag name is required"),
  });

  private constructor(readonly data: Readonly<IDocumentCreateDTO>) {
    super();
  }

  static create(data: unknown) {
    return BaseDto.validate(DocumentCreateDTO.schema, data).map(
      (parsed) => new DocumentCreateDTO(parsed)
    );
  }
}

export interface IUpdatedDocumentData {
  fileName?: string;
  fileExtension?: string;
  documentId: string;
  userId: string;
}

export class UpdateDocumentDTO extends BaseDto {
  private static readonly schema = z.object({
    fileName: z.string().min(1, "File name cannot be empty"),
    fileExtension: z.string().min(1, "File extension cannot be empty"),
    userId: z
      .string()
      .min(1, "User ID cannot be empty")
      .uuid("Invalid user ID"),
    documentId: z
      .string()
      .min(1, "Document ID cannot be empty")
      .uuid("Invalid document ID"),
  });

  private constructor(readonly data: Readonly<IUpdatedDocumentData>) {
    super();
  }

  static create(data: unknown) {
    return BaseDto.validate(UpdateDocumentDTO.schema, data).map(
      (parsed) => new UpdateDocumentDTO(parsed)
    );
  }
}

export interface IDeleteDocumentDTO {
  documentId: string;
  userId:string;
}

export class DeleteDocumentDTO extends BaseDto {
  private static readonly schema = z.object({
    documentId: z
      .string()
      .min(1, "Document ID cannot be empty")
      .uuid("Invalid document ID"),
    userId: z
      .string()
      .min(1, "User ID cannot be empty")
      .uuid("Invalid user ID"),
  });

  private constructor(readonly data: Readonly<IDeleteDocumentDTO>) {
    super();
  }

  static create(data: unknown) {
    return BaseDto.validate(DeleteDocumentDTO.schema, data).map(
      (parsed) => new DeleteDocumentDTO(parsed)
    );
  }
}

export interface IAdvancedSearchDTO{
  tagNames: string[];
}
export class AdvancedSearchDTO extends BaseDto {
  private static readonly schema = z.object({
    tagNames: z.array(z.string()).min(1, "At least one tag name is required"),
  });

  private constructor(readonly data: Readonly<IAdvancedSearchDTO>) {
    super();
  }

  static create(data: unknown) {
    return BaseDto.validate(AdvancedSearchDTO.schema, data).map(
      (parsed) => new AdvancedSearchDTO(parsed)
    );
  }
}

