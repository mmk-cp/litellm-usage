import { liteLLMClient } from "../clients/litellm.client.js";
import { AppError } from "../utils/app-error.js";
import { keyId, maskKey, string } from "../utils/format.js";

export class KeyService {
  async validate(name: string, apiKey: string) {
    const response = await liteLLMClient.getKeyInfo(apiKey);
    const info = (response.info ?? response) as Record<string, unknown>;
    if (info.blocked === true)
      throw new AppError(403, "KEY_BLOCKED", "این کلید API در LiteLLM مسدود شده است.");
    if (typeof info.expires === "string" && new Date(info.expires).getTime() <= Date.now()) {
      throw new AppError(401, "KEY_EXPIRED", "اعتبار این کلید API به پایان رسیده است.");
    }
    return {
      id: keyId(apiKey),
      name,
      maskedKey: maskKey(apiKey),
      alias: typeof info.key_alias === "string" ? info.key_alias : null,
      lastActive: typeof info.last_active === "string" ? info.last_active : null,
      createdAt: new Date().toISOString(),
      models: Array.isArray(info.models)
        ? info.models.filter((item): item is string => typeof item === "string")
        : [],
      status: info.blocked === true ? "blocked" : "active",
      spend: Number(info.spend ?? 0),
      label: string(info.key_alias, name),
    };
  }
}

export const keyService = new KeyService();
