import { BaseValueObject } from "@carbonteq/hexapp";
import { z } from "zod";
import { Result } from "@carbonteq/fp";

export interface IEmail {
  email: string;
}

const schema = z.object({
  email: z.string().email(),
});


export class EmailVO extends BaseValueObject<string> {
  private constructor(readonly email: string) {
    super();
  }
  static create(data: string): Result<EmailVO, Error> {
    const result = schema.safeParse({ email: data });
    if (!result.success) {
      return Result.Err(new Error(result.error.message));
    }
    return Result.Ok(new EmailVO(result.data.email));
  }

  serialize() {
    return this.email;
  }
}

