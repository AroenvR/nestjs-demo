import { Catch, BadRequestException, HttpStatus } from '@nestjs/common';
import { NestLogger } from '../../infrastructure/logging/NestLogger';
import { AbstractHttpFilter } from './AbstractHttpFilter';
import { HttpExceptionMessages } from '../enums/HttpExceptionMessages';

@Catch(BadRequestException)
export class BadRequestExceptionFilter extends AbstractHttpFilter {
	protected status = HttpStatus.BAD_REQUEST;
	protected message = HttpExceptionMessages.BAD_REQUEST;

	constructor(logAdapter: NestLogger) {
		super(logAdapter);
	}
}
