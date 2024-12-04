import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { isTruthy } from 'ts-istruthy';
import { NewWinstonAdapter } from '../../infrastructure/logging/adapters/NewWinstonAdapter';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
	constructor(private readonly logger: NewWinstonAdapter) {}

	use(req: Request, res: Response, next: NextFunction) {
		const startTime = performance.now();
		const { method, originalUrl } = req;

		// Setup a correlation for the complete request/response cycle
		const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
		this.logger.correlationManager.runWithCorrelationId(correlationId, () => {
			// Log the incoming request
			this.logger.log('LoggerMiddleware', `Request: ${method} ${originalUrl}`);
			this.logger.verbose('LoggerMiddleware', `Request Headers: ${JSON.stringify(req.headers)}`);
			if (isTruthy(req.body)) this.logger.verbose('LoggerMiddleware', `Request Body: ${JSON.stringify(req.body)}`);
			if (isTruthy(req.query)) this.logger.verbose('LoggerMiddleware', `Request Query: ${JSON.stringify(req.query)}`);
			if (isTruthy(req.params)) this.logger.verbose('LoggerMiddleware', `Request Params: ${JSON.stringify(req.params)}`);

			// Hook into the 'finish' event to log the response details
			res.on('finish', () => {
				const { statusCode } = res;
				const contentLength = res.get('Content-Length');
				const duration = performance.now() - startTime;

				this.logger.log(
					'LoggerMiddleware',
					`Response: ${method} ${originalUrl} - Status: ${statusCode} - Content-Length: ${contentLength || 0} bytes - Time: ${duration} milliseconds.`,
				);
			});

			next();
		});
	}
}
