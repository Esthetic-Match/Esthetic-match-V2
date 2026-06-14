// src/lib/api/with-api-handler.ts

import type { NextRequest } from "next/server";
import { apiError } from "./error-handler";

type ApiRequest = Request | NextRequest;

type ApiHandler<TContext = unknown, TRequest extends ApiRequest = Request> = (
  req: TRequest,
  context: TContext
) => Promise<Response>;

export function withApiHandler<
  TContext = unknown,
  TRequest extends ApiRequest = Request
>(handler: ApiHandler<TContext, TRequest>) {
  return async function wrappedHandler(req: TRequest, context: TContext) {
    try {
      return await handler(req, context);
    } catch (error) {
      return apiError(error, {
        method: req.method,
        url: req.url,
      });
    }
  };
}