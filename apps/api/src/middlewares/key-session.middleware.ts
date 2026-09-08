import type { RequestHandler } from "express";
import { KEY_COOKIE_PREFIX } from "../configs/constants.js";
import { AppError } from "../utils/app-error.js";
import { keyIdSchema } from "../validators/key.validator.js";
import { unsealApiKey } from "../utils/key-vault.js";

export const requireKeySession: RequestHandler = (request, _response, next) => {
  const id = keyIdSchema.safeParse(request.params.id);
  if (!id.success) return next(new AppError(400, "INVALID_KEY_ID", "شناسه کلید معتبر نیست."));
  const sealed = request.cookies[`${KEY_COOKIE_PREFIX}${id.data}`] as string | undefined;
  if (!sealed)
    return next(
      new AppError(401, "KEY_SESSION_EXPIRED", "برای ادامه، این کلید API را دوباره وارد کنید."),
    );
  request.userApiKey = unsealApiKey(sealed);
  next();
};
