import { z } from "zod";

const optionalDate = z.string().date().optional();
const optionalNumber = z.coerce.number().nonnegative().optional();

export const filtersSchema = z
  .object({
    startDate: optionalDate,
    endDate: optionalDate,
    model: z.string().trim().max(200).optional(),
    status: z.enum(["success", "failed"]).optional(),
    minCost: optionalNumber,
    maxCost: optionalNumber,
  })
  .refine((data) => !data.startDate || !data.endDate || data.startDate <= data.endDate, {
    message: "startDate must be before endDate",
  })
  .refine(
    (data) =>
      data.minCost === undefined || data.maxCost === undefined || data.minCost <= data.maxCost,
    {
      message: "minCost must not exceed maxCost",
    },
  );

export const requestsQuerySchema = filtersSchema.and(
  z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(10).max(100).default(25),
    search: z.string().trim().max(200).optional(),
    sortBy: z.enum(["timestamp", "model", "tokens", "cost", "latency"]).default("timestamp"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
);
