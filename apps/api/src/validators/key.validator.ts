import { z } from "zod";

export const validateKeySchema = z.object({
  name: z.string().trim().min(2).max(60),
  apiKey: z.string().trim().min(8).max(512),
});

export const keyIdSchema = z.string().regex(/^[a-f0-9]{20}$/);
