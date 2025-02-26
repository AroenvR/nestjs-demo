import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { isTruthy } from 'ts-istruthy';
import { WinstonAdapter } from '../../infrastructure/logging/adapters/WinstonAdapter';
import { ILogger } from 'src/infrastructure/logging/ILogger';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
	private readonly logger: ILogger;

	constructor(logAdapter: WinstonAdapter) {
		this.logger = logAdapter.getPrefixedLogger(this.constructor.name);
	}

	use(req: Request, res: Response, next: NextFunction) {
		const startTime = performance.now();
		const { method, originalUrl } = req;

		// Setup a correlation for the complete request/response cycle
		const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();

		this.logger.correlationManager.runWithCorrelationId(correlationId, () => {
			// Log the incoming request
			this.logger.log(`Request: ${method} ${originalUrl}`);

			// @Security - These three verbose logs can log sensitive data like data coming in and going out of this API
			//              As well as important security headers.
			this.logger.verbose(`Request Headers: ${JSON.stringify(req.headers)}`);
			if (isTruthy(req.body)) this.logger.verbose(`Request Body: ${JSON.stringify(req.body)}`);
			if (isTruthy(req.query)) this.logger.verbose(`Request Query: ${JSON.stringify(req.query)}`);

			// Hook into the 'finish' event to log the response details
			res.on('finish', () => {
				const { statusCode } = res;
				const contentLength = res.get('Content-Length');
				const duration = performance.now() - startTime;

				this.logger.log(
					`Response: ${method} ${originalUrl} - Status: ${statusCode} - Content-Length: ${contentLength || 0} bytes - Time: ${duration} milliseconds.`,
				);
			});

			next();
		});
	}
}
