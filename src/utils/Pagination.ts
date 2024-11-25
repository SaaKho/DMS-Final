import { PaginationOptions } from "@carbonteq/hexapp";

export const toPaginated = <T>(
  data: T[],
  opts: PaginationOptions,
  total: number,
) => {
  return {
    data,
    pageNum: opts.pageNum,
    pageSize: opts.pageSize,
    totalPages: Math.ceil(total / opts.pageSize),
    count: total,
  }
}