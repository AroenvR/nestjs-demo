// src/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { LogAdapter } from '../logging/LogAdapter';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	// TODO: Document & Test
	private readonly name = 'AllExceptionsFilter';

	constructor(private readonly logger: LogAdapter) {}

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();
		const request = ctx.getRequest();

		const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
		const message = exception instanceof HttpException ? exception.getResponse() : exception;

		const errorResponse = {
			statusCode: status,
			timestamp: Date.now(),
			path: request.url,
			message,
		};

		// Log the stack trace or the error message
		if (exception instanceof Error) {
			this.logger.warn(`${this.name}: API Error occurred: ${exception.message}`);
			this.logger.debug(`${this.name}: Stack trace: ${exception.stack}`);
		}

		// Send the response
		response.status(status).json(errorResponse);
	}
}
