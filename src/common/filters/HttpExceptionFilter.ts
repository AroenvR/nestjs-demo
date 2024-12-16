import { Catch, HttpStatus, HttpException, ArgumentsHost } from '@nestjs/common';
import { AbstractHttpFilter } from './AbstractHttpFilter';
import { HttpExceptionMessages } from '../enums/HttpExceptionMessages';
import { NewWinstonAdapter } from '../../infrastructure/logging/adapters/NewWinstonAdapter';

@Catch(HttpException)
export class HttpExceptionFilter extends AbstractHttpFilter {
	protected status = HttpStatus.INTERNAL_SERVER_ERROR;
	protected message = HttpExceptionMessages.INTERNAL_SERVER_ERROR;

	constructor(logAdapter: NewWinstonAdapter) {
		super(logAdapter);
	}

	catch(exception: HttpException, host: ArgumentsHost) {
		// ValidationPipes throw HttpExceptions with BadRequestExceptions inside.
		if (exception.name === 'BadRequestException') {
			this.status = HttpStatus.BAD_REQUEST;
			this.message = HttpExceptionMessages.BAD_REQUEST;
		}

		super.catch(exception, host);

		this.logger.warn(`Exception was caught by the default HTTP exception filter.`);
	}
}
