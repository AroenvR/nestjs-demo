// src/middleware/logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { LogAdapter } from '../logging/LogAdapter';
import { isTruthy } from 'ts-istruthy';

@Injectable()
export class LoggerMiddleware implements NestMiddleware { // TODO: Document & Test
    constructor(private readonly logger: LogAdapter) { }

    use(req: Request, res: Response, next: NextFunction) {
        const startTime = performance.now();
        const { method, originalUrl } = req;

        // Setup a correlation for the complete request/response cycle
        const correlationId = req.headers['x-correlation-id'] as string || randomUUID();
        this.logger.getLogger().correlationManager.runWithCorrelationId(correlationId, () => {

            // Log the incoming request
            this.logger.info(`Request: ${method} ${originalUrl}`);
            this.logger.verbose(`Request Headers: ${JSON.stringify(req.headers)}`);
            if (isTruthy(req.body)) this.logger.verbose(`Request Body: ${JSON.stringify(req.body)}`);
            if (isTruthy(req.query)) this.logger.verbose(`Request Query: ${JSON.stringify(req.query)}`);
            if (isTruthy(req.params)) this.logger.verbose(`Request Params: ${JSON.stringify(req.params)}`);

            // Hook into the 'finish' event to log the response details
            res.on('finish', () => {
                const { statusCode } = res;
                const contentLength = res.get('Content-Length');
                const duration = performance.now() - startTime;

                this.logger.info(
                    `Response: ${method} ${originalUrl} - Status: ${statusCode} - Content-Length: ${contentLength || 0} bytes - Time: ${duration} milliseconds.`
                );
            });

            next();
        });
    }
}
