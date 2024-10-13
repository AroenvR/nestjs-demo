import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { LogAdapter } from '../logging/LogAdapter';
import { AbstractHttpFilter } from '../abstract/AbstractHttpFilter';
import { HttpExceptionMessages } from './HttpExceptionMessages';

@Catch(Error)
export class HttpErrorFilter extends AbstractHttpFilter {
	protected status = HttpStatus.INTERNAL_SERVER_ERROR;
	protected message = HttpExceptionMessages.INTERNAL_SERVER_ERROR;

	constructor(logAdapter: LogAdapter) {
		super(logAdapter);
	}

	catch(exception: Error, host: ArgumentsHost) {
		super.catch(exception, host);

		this.logger.warn(`Exception was caught by the default Error filter.`);
	}
}
