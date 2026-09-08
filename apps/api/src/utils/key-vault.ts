import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { env } from "../configs/env.js";
import { AppError } from "./app-error.js";

const key = Buffer.from(env.SESSION_ENCRYPTION_KEY, "hex");
const algorithm = "aes-256-gcm";

export function sealApiKey(apiKey: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(apiKey, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function unsealApiKey(payload: string): string {
  try {
    const data = Buffer.from(payload, "base64url");
    if (data.toString("base64url") !== payload) throw new Error("Invalid sealed payload encoding");
    if (data.length < 29) throw new Error("Invalid sealed payload");
    const iv = data.subarray(0, 12);
    const tag = data.subarray(12, 28);
    const encrypted = data.subarray(28);
    const decipher = createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    throw new AppError(401, "KEY_SESSION_EXPIRED", "نشست ذخیره‌شده این کلید دیگر در دسترس نیست.");
  }
}
