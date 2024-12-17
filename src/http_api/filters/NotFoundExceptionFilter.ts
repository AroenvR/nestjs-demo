import { Catch, HttpStatus, NotFoundException } from '@nestjs/common';
import { AbstractHttpFilter } from './AbstractHttpFilter';
import { HttpExceptionMessages } from '../../common/enums/HttpExceptionMessages';
import { NewWinstonAdapter } from '../../infrastructure/logging/adapters/NewWinstonAdapter';

@Catch(NotFoundException)
export class NotFoundExceptionFilter extends AbstractHttpFilter {
	protected status = HttpStatus.NOT_FOUND;
	protected message = HttpExceptionMessages.NOT_FOUND;

	constructor(logAdapter: NewWinstonAdapter) {
		super(logAdapter);
	}
}
