import { Catch, HttpStatus, NotImplementedException } from '@nestjs/common';
import { NestLogger } from '../../infrastructure/logging/NestLogger';
import { AbstractHttpFilter } from './AbstractHttpFilter';
import { HttpExceptionMessages } from '../enums/HttpExceptionMessages';

@Catch(NotImplementedException)
export class NotImplementedExceptionFilter extends AbstractHttpFilter {
	protected status = HttpStatus.NOT_IMPLEMENTED;
	protected message = HttpExceptionMessages.NOT_IMPLEMENTED;

	constructor(logAdapter: NestLogger) {
		super(logAdapter);
	}
}
