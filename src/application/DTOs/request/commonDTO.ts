import { BaseDto } from "@carbonteq/hexapp";
import { z } from "zod";

export interface IidDTO {
  id: string;
}

export class UUIDDTO extends BaseDto {
  private static readonly schema = z.object({
    id: z.string().min(1, "Id cannot be empty").uuid("Invalid id"),
  });

  private constructor(readonly data: Readonly<IidDTO>) {
    super();
  }

  static create(data: unknown) {
    return BaseDto.validate(UUIDDTO.schema, data).map(
      (parsed) => new UUIDDTO(parsed)
    );
  }
}
