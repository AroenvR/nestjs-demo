import { Catch, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { LogAdapter } from '../../infrastructure/logging/LogAdapter';
import { AbstractHttpFilter } from './AbstractHttpFilter';
import { HttpExceptionMessages } from '../enums/HttpExceptionMessages';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter extends AbstractHttpFilter {
	protected status = HttpStatus.UNAUTHORIZED;
	protected message = HttpExceptionMessages.UNAUTHORIZED;

	constructor(logAdapter: LogAdapter) {
		super(logAdapter);
	}
}
