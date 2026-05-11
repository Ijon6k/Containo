import { NextResponse, NextRequest } from 'next/server';
import { logger } from '../core/logger';
import { ZodError } from 'zod';

export function withErrorHandler<T extends Request>(handler: (req: T, ...args: any[]) => Promise<NextResponse | Response> | NextResponse | Response) {
  return async (req: T, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error: any) {
      if (error instanceof ZodError) {
        return NextResponse.json({ 
          error: 'Validation Error', 
          details: error.errors 
        }, { status: 400 });
      }

      logger.error('API', `Request failed: ${req.method} ${req.url}`, error);
      
      const status = error.statusCode || 500;
      const message = error.message || 'Internal Server Error';

      return NextResponse.json({ error: message }, { status });
    }
  };
}
