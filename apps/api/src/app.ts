import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./configs/env.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import { internalAuth } from "./middlewares/internal-auth.middleware.js";
import { keyRouter } from "./routes/key.routes.js";
import { usageRouter } from "./routes/usage.routes.js";

export const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());
app.get("/health", (_request, response) =>
  response.json({ success: true, data: { status: "ok" } }),
);
app.use("/api", internalAuth);
app.use(
  "/api",
  rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: "draft-8", legacyHeaders: false }),
);
app.use("/api/keys", keyRouter);
app.use("/api/keys/:id", usageRouter);
app.use(notFound);
app.use(errorHandler);
