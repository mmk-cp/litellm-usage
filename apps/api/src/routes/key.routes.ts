import { Router } from "express";
import { deleteKey, validateKey } from "../controllers/key.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const keyRouter = Router();
keyRouter.post("/validate", asyncHandler(validateKey));
keyRouter.delete("/:id", asyncHandler(deleteKey));
