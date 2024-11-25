import { Request, Response } from "express";

export const handleResponse = <T>(
  result: any,
  res: Response,
  successStatus = 200
) => {
  if (result.isErr()) {
    return res.status(500).json({ error: result.unwrapErr().message });
  }
  return res.status(successStatus).json(result.unwrap());
};
