import { Catch, HttpStatus, HttpException, ArgumentsHost } from '@nestjs/common';
import { AbstractHttpFilter } from '../AbstractHttpFilter';
import { HttpExceptionMessages } from '../../../common/enums/HttpExceptionMessages';
import { WinstonAdapter } from '../../../infrastructure/logging/adapters/WinstonAdapter';

@Catch(HttpException)
export class HttpExceptionFilter extends AbstractHttpFilter {
	protected status = HttpStatus.INTERNAL_SERVER_ERROR;
	protected message = HttpExceptionMessages.INTERNAL_SERVER_ERROR;

	constructor(logAdapter: WinstonAdapter) {
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
