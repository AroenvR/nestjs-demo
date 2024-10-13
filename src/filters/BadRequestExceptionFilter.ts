import { Catch, BadRequestException, HttpStatus } from '@nestjs/common';
import { LogAdapter } from '../logging/LogAdapter';
import { AbstractHttpFilter } from '../abstract/AbstractHttpFilter';
import { HttpExceptionMessages } from './HttpExceptionMessages';

@Catch(BadRequestException)
export class BadRequestExceptionFilter extends AbstractHttpFilter {
	protected status = HttpStatus.BAD_REQUEST;
	protected message = HttpExceptionMessages.BAD_REQUEST;

	constructor(logAdapter: LogAdapter) {
		super(logAdapter);
	}
}
