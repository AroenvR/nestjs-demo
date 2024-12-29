import { ArgumentsHost, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';
import { GuardedController } from '../controllers/GuardedController'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { ILogger } from '../../infrastructure/logging/ILogger';
import { WinstonAdapter } from '../../infrastructure/logging/adapters/WinstonAdapter';

/**
 * Abstract class for creating custom exception filters for HTTP requests.
 * @devnote When creating a new filter, remember to add it to the necessary controllers (such as the {@link GuardedController})
 * Using the UseFilters decorator.
 */
export abstract class AbstractHttpFilter implements ExceptionFilter {
	protected context: HttpArgumentsHost;
	protected response: Response;
	protected request: Request;
	protected logger: ILogger;
	protected status = HttpStatus.INTERNAL_SERVER_ERROR;
	protected message = 'internal_server_error';

	constructor(private readonly logAdapter: WinstonAdapter) {
		this.logger = this.logAdapter.getPrefixedLogger(this.name);
	}

	catch(error: unknown, host: ArgumentsHost) {
		this.context = host.switchToHttp();

		this.response = this.context.getResponse();
		this.request = this.context.getRequest();

		this.logger.error(`${error instanceof Error ? error.message : 'Unknown issue.'}`, error);

		const responseObj = {
			statusCode: this.status,
			timestamp: Date.now(),
			path: this.request.url,
			message: this.message,
		};

		// Send the response
		this.response.status(this.status).json(responseObj);
	}

	/* Getters & Setters */

	public get name() {
		return this.constructor.name;
	}
}
