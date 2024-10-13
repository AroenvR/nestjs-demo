import { Catch, HttpStatus, HttpException, ArgumentsHost } from '@nestjs/common';
import { LogAdapter } from '../logging/LogAdapter';
import { AbstractHttpFilter } from '../abstract/AbstractHttpFilter';
import { HttpExceptionMessages } from './HttpExceptionMessages';

@Catch(HttpException)
export class HttpExceptionFilter extends AbstractHttpFilter {
	protected status = HttpStatus.INTERNAL_SERVER_ERROR;
	protected message = HttpExceptionMessages.INTERNAL_SERVER_ERROR;

	constructor(logAdapter: LogAdapter) {
		super(logAdapter);
	}

	catch(exception: HttpException, host: ArgumentsHost) {
		super.catch(exception, host);

		this.logger.warn(`Exception was caught by the default HTTP exception filter.`);
	}
}
