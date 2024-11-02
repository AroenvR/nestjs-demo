import { Catch, HttpStatus, NotFoundException } from '@nestjs/common';
import { LogAdapter } from '../../infrastructure/logging/LogAdapter';
import { AbstractHttpFilter } from '../../abstract/AbstractHttpFilter';
import { HttpExceptionMessages } from '../enums/HttpExceptionMessages';

@Catch(NotFoundException)
export class NotFoundExceptionFilter extends AbstractHttpFilter {
	protected status = HttpStatus.NOT_FOUND;
	protected message = HttpExceptionMessages.NOT_FOUND;

	constructor(logAdapter: LogAdapter) {
		super(logAdapter);
	}
}
