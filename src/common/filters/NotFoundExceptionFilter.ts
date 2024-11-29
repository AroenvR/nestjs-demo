import { Catch, HttpStatus, NotFoundException } from '@nestjs/common';
import { NestLogger } from '../../infrastructure/logging/NestLogger';
import { AbstractHttpFilter } from './AbstractHttpFilter';
import { HttpExceptionMessages } from '../enums/HttpExceptionMessages';

@Catch(NotFoundException)
export class NotFoundExceptionFilter extends AbstractHttpFilter {
	protected status = HttpStatus.NOT_FOUND;
	protected message = HttpExceptionMessages.NOT_FOUND;

	constructor(logAdapter: NestLogger) {
		super(logAdapter);
	}
}
