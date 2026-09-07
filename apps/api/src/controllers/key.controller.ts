import type { RequestHandler } from "express";
import { env } from "../configs/env.js";
import { KEY_COOKIE_PREFIX, KEY_COOKIE_TTL_SECONDS } from "../configs/constants.js";
import { keyService } from "../services/key.service.js";
import { sealApiKey } from "../utils/key-vault.js";
import { keyIdSchema, validateKeySchema } from "../validators/key.validator.js";

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/api",
  maxAge: KEY_COOKIE_TTL_SECONDS * 1000,
};

export const validateKey: RequestHandler = async (request, response) => {
  const input = validateKeySchema.parse(request.body);
  const data = await keyService.validate(input.name, input.apiKey);
  response.cookie(`${KEY_COOKIE_PREFIX}${data.id}`, sealApiKey(input.apiKey), cookieOptions);
  response.status(201).json({ success: true, data });
};

export const deleteKey: RequestHandler = async (request, response) => {
  const id = keyIdSchema.parse(request.params.id);
  response.clearCookie(`${KEY_COOKIE_PREFIX}${id}`, cookieOptions);
  response.json({ success: true, data: { id } });
};
