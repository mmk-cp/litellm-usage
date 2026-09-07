import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error.js";

export const notFound: RequestHandler = (_request, _response, next) => {
  next(new AppError(404, "NOT_FOUND", "The requested endpoint does not exist."));
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  void next;
  if (error instanceof ZodError) {
    response.status(400).json({
      success: false,
      message: error.issues[0]?.message ?? "Invalid request.",
      errorCode: "VALIDATION_ERROR",
    });
    return;
  }
  if (error instanceof AppError) {
    response
      .status(error.statusCode)
      .json({ success: false, message: error.message, errorCode: error.errorCode });
    return;
  }
  console.error("Unhandled API error");
  response.status(500).json({
    success: false,
    message: "An unexpected error occurred.",
    errorCode: "INTERNAL_ERROR",
  });
};
