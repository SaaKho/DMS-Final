import { BaseDto, UUID } from "@carbonteq/hexapp";
import { Option } from "@carbonteq/fp";
import { z } from "zod";

export interface ICreateTagDTO {
  name: string;
  documentId: UUID;
}

export class CreateTagDTO extends BaseDto {
  private static schema = z.object({
    name: z
      .string()
      .min(1, "Tag name cannot be empty")
      .max(50, "Tag name cannot exceed 50 characters"),
    documentId: z.string().uuid().transform(UUID.fromTrusted),
  });
  private constructor(readonly data: Readonly<ICreateTagDTO>) {
    super();
  }
  static create(data: unknown) {
    return BaseDto.validate(CreateTagDTO.schema, data).map(
      (parsed) => new CreateTagDTO(parsed)
    );
  }
}

export interface IUpdateTagDTO {
  name: string;
  id:string;
}

export class UpdateTagDTO extends BaseDto {
  private static schema = z.object({
    name: z
      .string()
      .min(1, "Tag name cannot be empty")
      .max(50, "Tag name cannot exceed 50 characters"),
    id: z.string().uuid(),
  });
  private constructor(readonly data: Readonly<IUpdateTagDTO>) {
    super();
  }
  static create(data: unknown) {
    return BaseDto.validate(UpdateTagDTO.schema, data).map(
      (parsed) => new UpdateTagDTO(parsed)
    );
  }
}


