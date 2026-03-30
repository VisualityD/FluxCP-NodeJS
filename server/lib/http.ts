import type { NextFunction, Request, Response } from "express";

type AsyncRoute = (request: Request, response: Response, next: NextFunction) => Promise<void>;

export function asyncHandler(route: AsyncRoute) {
  return (request: Request, response: Response, next: NextFunction) => {
    route(request, response, next).catch(next);
  };
}

export function normalizeError(error: unknown): { status: number; message: string; logMessage: string } {
  const candidate = error as { code?: string; message?: string; errno?: number };

  if (candidate?.code === "ER_ACCESS_DENIED_ERROR") {
    return {
      status: 503,
      message: "Database access denied. Check your FLUX_* database credentials in .env.",
      logMessage: "[api] Database access denied."
    };
  }

  if (candidate?.code === "ECONNREFUSED") {
    return {
      status: 503,
      message: "Database connection refused. Check host, port and server availability.",
      logMessage: "[api] Database connection refused."
    };
  }

  return {
    status: 500,
    message: candidate?.message || "Internal server error.",
    logMessage: `[api] ${candidate?.message || "Unhandled error."}`
  };
}
