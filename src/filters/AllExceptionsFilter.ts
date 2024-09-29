import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { LogAdapter } from '../logging/LogAdapter';

@Catch()
/**
 * A global exception filter that catches all exceptions thrown in the application.
 * Logs exception details and sends a standardized JSON error response without any sensitive data.
 */
export class AllExceptionsFilter implements ExceptionFilter {
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
