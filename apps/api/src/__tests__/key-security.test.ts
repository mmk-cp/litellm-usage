import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { app } from "../app.js";
import { env } from "../configs/env.js";
import { hashApiKey, keyId } from "../utils/format.js";
import { sealApiKey, unsealApiKey } from "../utils/key-vault.js";
import { filtersSchema } from "../validators/usage.validator.js";

describe("key session security", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns only masked metadata and puts the key in a protected cookie", async () => {
    const userKey = "sk-user-secret-value-1234";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ info: { key_alias: "prod", spend: 1.25, models: ["gpt-5"] } }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    const response = await request(app)
      .post("/api/keys/validate")
      .set("x-internal-api-secret", env.INTERNAL_API_SECRET)
      .send({ name: "Production", apiKey: userKey });

    expect(response.status).toBe(201);
    expect(JSON.stringify(response.body)).not.toContain(userKey);
    expect(JSON.stringify(response.body)).not.toContain(env.LITELLM_ADMIN_KEY);
    expect(response.body.data.maskedKey).toBe("sk-********1234");
    const cookie = response.headers["set-cookie"]?.[0] as string;
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Strict");
    expect(cookie).not.toContain(userKey);
  });

  it("rejects callers that bypass the Next.js BFF", async () => {
    const response = await request(app)
      .post("/api/keys/validate")
      .send({ name: "Production", apiKey: "sk-example" });
    expect(response.status).toBe(401);
    expect(response.body.errorCode).toBe("UNAUTHORIZED");
  });

  it("encrypts key sessions with unique authenticated ciphertext", () => {
    const apiKey = "sk-sensitive-value";
    const first = sealApiKey(apiKey);
    const second = sealApiKey(apiKey);
    expect(first).not.toBe(second);
    expect(first).not.toContain(apiKey);
    expect(unsealApiKey(first)).toBe(apiKey);
    expect(() => unsealApiKey(`${first.slice(0, -1)}x`)).toThrow();
  });

  it("rejects invalid date and cost ranges", () => {
    expect(
      filtersSchema.safeParse({ startDate: "2026-09-08", endDate: "2026-09-01" }).success,
    ).toBe(false);
    expect(filtersSchema.safeParse({ minCost: "10", maxCost: "1" }).success).toBe(false);
  });

  it("uses the full LiteLLM SHA-256 token hash while exposing only a short identifier", () => {
    const apiKey = "abc";
    const hash = hashApiKey(apiKey);
    expect(hash).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(keyId(apiKey)).toBe(hash.slice(0, 20));
  });
});
