// src/middleware/logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LogAdapter } from 'src/logging/LogAdapter';
import { isTruthy } from 'ts-istruthy';

@Injectable()
export class LoggerMiddleware implements NestMiddleware { // TODO: Document & Test
    constructor(private readonly logger: LogAdapter) { }

    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl } = req;

        const startTime = performance.now();

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
    }
}
