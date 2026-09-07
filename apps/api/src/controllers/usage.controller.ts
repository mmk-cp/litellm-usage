import type { RequestHandler } from "express";
import { usageService } from "../services/usage.service.js";
import { filtersSchema, requestsQuerySchema } from "../validators/usage.validator.js";

function apiKey(request: Parameters<RequestHandler>[0]): string {
  if (!request.userApiKey) throw new Error("Key session middleware is required");
  return request.userApiKey;
}

export const getUsage: RequestHandler = async (request, response) => {
  const filters = filtersSchema.parse(request.query);
  response.json({ success: true, data: await usageService.usage(apiKey(request), filters) });
};

export const getRequests: RequestHandler = async (request, response) => {
  const query = requestsQuerySchema.parse(request.query);
  const result = await usageService.requests(apiKey(request), query);
  response.json({ success: true, data: result.data, pagination: result.pagination });
};

export const getModels: RequestHandler = async (request, response) => {
  const filters = filtersSchema.parse(request.query);
  response.json({ success: true, data: await usageService.models(apiKey(request), filters) });
};

export const getCosts: RequestHandler = async (request, response) => {
  const filters = filtersSchema.parse(request.query);
  response.json({ success: true, data: await usageService.costs(apiKey(request), filters) });
};
