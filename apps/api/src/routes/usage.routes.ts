import { Router } from "express";
import { getCosts, getModels, getRequests, getUsage } from "../controllers/usage.controller.js";
import { requireKeySession } from "../middlewares/key-session.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

export const usageRouter = Router({ mergeParams: true });
usageRouter.use(requireKeySession);
usageRouter.get("/usage", asyncHandler(getUsage));
usageRouter.get("/requests", asyncHandler(getRequests));
usageRouter.get("/models", asyncHandler(getModels));
usageRouter.get("/costs", asyncHandler(getCosts));
