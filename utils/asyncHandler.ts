import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ParsedQs } from "qs";

export function asyncHandler<
  Params extends ParamsDictionary = ParamsDictionary,
  ResponseBody = unknown,
  RequestBody = unknown,
  Query extends ParsedQs = ParsedQs,
>(
  requestHandler: (
    req: Request<Params, ResponseBody, RequestBody, Query>,
    res: Response<ResponseBody>,
    next: NextFunction,
  ) => unknown,
): RequestHandler<Params, ResponseBody, RequestBody, Query> {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };
}