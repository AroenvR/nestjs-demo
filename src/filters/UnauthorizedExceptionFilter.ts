import { Catch, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { LogAdapter } from '../logging/LogAdapter';
import { AbstractHttpFilter } from '../abstract/AbstractHttpFilter';
import { HttpExceptionMessages } from './HttpExceptionMessages';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter extends AbstractHttpFilter {
	protected status = HttpStatus.UNAUTHORIZED;
	protected message = HttpExceptionMessages.UNAUTHORIZED;

	constructor(logAdapter: LogAdapter) {
		super(logAdapter);
	}
}
