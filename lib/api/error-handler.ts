// src/lib/api/error-handler.ts

import { NextResponse } from "next/server";

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status = 500, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type ApiLogContext = {
  method?: string;
  url?: string;
};

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(error: unknown, context?: ApiLogContext) {
  logApiError(error, context);

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details:
          process.env.NODE_ENV === "development" ? error.details : undefined,
      },
      { status: error.status }
    );
  }

  if (isPrismaKnownError(error)) {
    return handlePrismaKnownError(error);
  }

  if (isPrismaValidationError(error)) {
    return NextResponse.json(
      {
        error: "Invalid database query.",
        code: "PRISMA_VALIDATION_ERROR",
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong.",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      error: "Something went wrong.",
      code: "UNKNOWN_ERROR",
    },
    { status: 500 }
  );
}

function logApiError(error: unknown, context?: ApiLogContext) {
  const isDevelopment = process.env.NODE_ENV === "development";

  const payload = {
    timestamp: new Date().toISOString(),
    method: context?.method,
    url: context?.url,
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: isDevelopment ? error.stack : undefined,
          }
        : error,
  };

  console.error("[API_ERROR]", JSON.stringify(payload, null, 2));
}

type PrismaKnownError = {
  code: string;
  message: string;
  meta?: {
    target?: string[] | string;
    [key: string]: unknown;
  };
};

function isPrismaKnownError(error: unknown): error is PrismaKnownError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string" &&
    (error as { code: string }).code.startsWith("P")
  );
}

function isPrismaValidationError(error: unknown) {
  return error instanceof Error && error.name === "PrismaClientValidationError";
}

function handlePrismaKnownError(error: PrismaKnownError) {
  switch (error.code) {
    case "P2002":
      return NextResponse.json(
        {
          error: "A record with this value already exists.",
          code: "UNIQUE_CONSTRAINT_FAILED",
          target: error.meta?.target,
        },
        { status: 409 }
      );

    case "P2025":
      return NextResponse.json(
        {
          error: "Record not found.",
          code: "RECORD_NOT_FOUND",
        },
        { status: 404 }
      );

    case "P2003":
      return NextResponse.json(
        {
          error: "Invalid relation. Related record does not exist.",
          code: "FOREIGN_KEY_CONSTRAINT_FAILED",
        },
        { status: 400 }
      );

    default:
      return NextResponse.json(
        {
          error:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Database error.",
          code: error.code,
        },
        { status: 500 }
      );
  }
}