import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { AbstractHttpFilter } from './AbstractHttpFilter';
import { HttpExceptionMessages } from '../enums/HttpExceptionMessages';
import { NewWinstonAdapter } from '../../infrastructure/logging/adapters/NewWinstonAdapter';

@Catch(Error)
export class HttpErrorFilter extends AbstractHttpFilter {
	protected status = HttpStatus.INTERNAL_SERVER_ERROR;
	protected message = HttpExceptionMessages.INTERNAL_SERVER_ERROR;

	constructor(logAdapter: NewWinstonAdapter) {
		super(logAdapter);
	}

	catch(exception: Error, host: ArgumentsHost) {
		// Non-existing routes throw HttpErrors with NotFoundExceptions inside.
		if (exception.name === 'NotFoundException') {
			this.status = HttpStatus.NOT_FOUND;
			this.message = HttpExceptionMessages.NOT_FOUND;
		}

		super.catch(exception, host);

		this.logger.warn(`Exception was caught by the default Error filter.`);
	}
}
