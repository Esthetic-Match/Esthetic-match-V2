import { NextResponse } from "next/server";

import {
  PostOpAuthorizationError,
} from "./authorization";

export function handlePostOpAuthorizationError(
  error: unknown,
) {
  if (
    error instanceof
    PostOpAuthorizationError
  ) {
    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: error.status,
      },
    );
  }

  return null;
}