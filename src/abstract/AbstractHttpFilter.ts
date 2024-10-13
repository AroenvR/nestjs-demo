import { ArgumentsHost, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { ILogger } from 'ts-log-adapter';
import { LogAdapter } from '../logging/LogAdapter';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';

/**
 * Abstract class for creating custom exception filters for HTTP requests.
 */
export abstract class AbstractHttpFilter implements ExceptionFilter {
	protected context: HttpArgumentsHost;
	protected response: Response;
	protected request: Request;
	protected logger: ILogger;
	protected status = HttpStatus.INTERNAL_SERVER_ERROR;
	protected message = 'internal_server_error';

	constructor(private readonly logAdapter: LogAdapter) {
		const name = this.constructor.name;
		this.logger = this.logAdapter.getPrefixedLogger(name);
	}

	catch(exception: unknown, host: ArgumentsHost) {
		this.context = host.switchToHttp();

		this.response = this.context.getResponse();
		this.request = this.context.getRequest();

		this.logger.error(`${exception}`);
		if (exception instanceof Error && exception.stack) this.logger.debug(exception.stack);

		const responseObj = {
			statusCode: this.status,
			timestamp: Date.now(),
			path: this.request.url,
			message: this.message,
		};

		// Send the response
		this.response.status(this.status).json(responseObj);
	}
}
