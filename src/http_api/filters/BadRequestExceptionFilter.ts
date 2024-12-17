import { Catch, BadRequestException, HttpStatus } from '@nestjs/common';
import { AbstractHttpFilter } from './AbstractHttpFilter';
import { HttpExceptionMessages } from '../../common/enums/HttpExceptionMessages';
import { NewWinstonAdapter } from '../../infrastructure/logging/adapters/NewWinstonAdapter';

@Catch(BadRequestException)
export class BadRequestExceptionFilter extends AbstractHttpFilter {
	protected status = HttpStatus.BAD_REQUEST;
	protected message = HttpExceptionMessages.BAD_REQUEST;

	constructor(logAdapter: NewWinstonAdapter) {
		super(logAdapter);
	}
}
