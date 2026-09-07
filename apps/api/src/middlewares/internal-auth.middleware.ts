import { timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { env } from "../configs/env.js";
import { AppError } from "../utils/app-error.js";

export const internalAuth: RequestHandler = (request, _response, next) => {
  const supplied = request.header("x-internal-api-secret") ?? "";
  const expected = env.INTERNAL_API_SECRET;
  const valid =
    supplied.length === expected.length &&
    timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
  if (!valid) return next(new AppError(401, "UNAUTHORIZED", "Unauthorized request."));
  next();
};
