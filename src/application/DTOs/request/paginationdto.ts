import { BaseDto } from "@carbonteq/hexapp";
import { z } from "zod";

export interface IPagination {
  pageSize: number;
  pageNum: number;
}

export class PaginationDTO extends BaseDto implements IPagination {
  static readonly defaultPageSize = 50;
  static readonly defaultPageNumber = 1;

  private static readonly schema = z.object({
    pageSize: z.coerce
      .number()
      .positive("pageSize must be a positive number")
      .default(PaginationDTO.defaultPageSize),

    pageNum: z.coerce
      .number()
      .positive("pageNumber must be a positive number")
      .default(PaginationDTO.defaultPageNumber),
  });

  readonly pageSize: number;
  readonly pageNum: number;

  private constructor(pageSize: number, pageNum: number) {
    super();
    this.pageSize = pageSize;
    this.pageNum = pageNum;
  }

  static create(data: unknown) {
    return BaseDto.validate(PaginationDTO.schema, data).map(
      ({ pageNum, pageSize }) => new PaginationDTO(pageSize, pageNum)
    );
  }
}
