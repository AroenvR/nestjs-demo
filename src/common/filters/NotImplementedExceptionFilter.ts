import { Catch, HttpStatus, NotImplementedException } from '@nestjs/common';
import { AbstractHttpFilter } from './AbstractHttpFilter';
import { HttpExceptionMessages } from '../enums/HttpExceptionMessages';
import { NewWinstonAdapter } from '../../infrastructure/logging/adapters/NewWinstonAdapter';

@Catch(NotImplementedException)
export class NotImplementedExceptionFilter extends AbstractHttpFilter {
	protected status = HttpStatus.NOT_IMPLEMENTED;
	protected message = HttpExceptionMessages.NOT_IMPLEMENTED;

	constructor(logAdapter: NewWinstonAdapter) {
		super(logAdapter);
	}
}
