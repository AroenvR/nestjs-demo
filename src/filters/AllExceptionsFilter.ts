import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { LogAdapter } from '../logging/LogAdapter';
import { ILogger } from 'ts-log-adapter';
import { QueryFailedError } from 'typeorm';

@Catch()
/**
 * A global exception filter that catches all exceptions thrown in the application.
 * Logs exception details and sends a standardized JSON error response without any sensitive data.
 * TODO: Test this object somehow.
 */
export class AllExceptionsFilter implements ExceptionFilter {
	protected logger: ILogger;

	constructor(private readonly logAdapter: LogAdapter) {
		const name = this.constructor.name;
		this.logger = this.logAdapter.getPrefixedLogger(name);
	}

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();
		const request = ctx.getRequest();

		let status: number;
		let message: string;

		switch (exception.constructor.name) {
			case 'QueryFailedError':
				status = HttpStatus.BAD_REQUEST;
				message = `Query failed error: ${(exception as QueryFailedError).message}`;

				this.logger.verbose(
					`QueryFailedError query: ${(exception as QueryFailedError).query} - parameters: ${(exception as QueryFailedError).parameters}`,
				);

				// TODO: Figure out how to enforce adding of this replacement when a new DB gets supported.
				message = message.replaceAll('SQLITE_CONSTRAINT: ', ''); // Add as new databases get added so the driver doesn't leak.
				break;

			case 'HttpException':
				status = (exception as HttpException).getStatus();
				message = (exception as HttpException).getResponse().toString();
				break;

			case 'NotFoundException':
				status = HttpStatus.NOT_FOUND;
				message = 'Resource not found.';
				break;

			default:
				this.logger.critical(`Failed to cleanly handle exception, unknown exception type: ${exception.constructor.name}`);

				status = HttpStatus.INTERNAL_SERVER_ERROR;
				message = 'Oops! Something went wrong.';
				break;
		}

		this.logger.error(`${exception}`);

		const errorResponse = {
			statusCode: status,
			timestamp: Date.now(),
			path: request.url,
			message,
		};

		// Send the response
		response.status(status).json(errorResponse);
	}
}
