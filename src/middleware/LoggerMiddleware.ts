// src/middleware/logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { isTruthy } from 'ts-istruthy';
import { LogAdapter } from '../logging/LogAdapter';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
	constructor(private readonly logger: LogAdapter) {}

	use(req: Request, res: Response, next: NextFunction) {
		const startTime = performance.now();
		const { method, originalUrl } = req;

		// Setup a correlation for the complete request/response cycle
		const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
		this.logger.getLogger().correlationManager.runWithCorrelationId(correlationId, () => {
			// Log the incoming request
			this.logger.info(`Request: ${method} ${originalUrl}`);
			this.logger.verbose(`Request Headers: ${JSON.stringify(req.headers)}`);
			if (isTruthy(req.body)) this.logger.verbose(`Request Body: ${JSON.stringify(req.body)}`);
			if (isTruthy(req.query)) this.logger.verbose(`Request Query: ${JSON.stringify(req.query)}`);
			if (isTruthy(req.params)) this.logger.verbose(`Request Params: ${JSON.stringify(req.params)}`);

			// try {

			// } catch (err: Error | unknown) {
			//     if (err instanceof QueryFailedError) {
			//         this.logger.debug(`Query failed error trying to save entity ${createDto.toString()}. ${err}`);
			//         this.logger.error(`Query failed error trying to save entity.`);
			//         throw new HttpException('Query failed error trying to save entity.', HttpStatus.BAD_REQUEST);
			//     }

			//     throw new HttpException('Error creating entity', HttpStatus.INTERNAL_SERVER_ERROR);
			// }

			// Hook into the 'finish' event to log the response details
			res.on('finish', () => {
				const { statusCode } = res;
				const contentLength = res.get('Content-Length');
				const duration = performance.now() - startTime;

				this.logger.info(
					`Response: ${method} ${originalUrl} - Status: ${statusCode} - Content-Length: ${contentLength || 0} bytes - Time: ${duration} milliseconds.`,
				);
			});

			next();
		});
	}
}
