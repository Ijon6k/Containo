import { NextResponse } from "next/server";
import { logger } from "../core/logger";
import { ZodError } from "zod";

export function withErrorHandler<T extends Request>(
  handler: (
    req: T,
    ...args: any[]
  ) => Promise<NextResponse | Response> | NextResponse | Response,
) {
  return async (req: T, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: "Validation Error",
            details: error.errors,
          },
          { status: 400 },
        );
      }

      logger.error("API", `Request failed: ${req.method} ${req.url}`, error);

      const err = error as Record<string, unknown>;
      const status = (err.statusCode as number) || 500;
      const message = (err.message as string) || "Internal Server Error";

      return NextResponse.json({ error: message }, { status });
    }
  };
}
