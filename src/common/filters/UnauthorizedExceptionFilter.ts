import { Catch, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { NestLogger } from '../../infrastructure/logging/NestLogger';
import { AbstractHttpFilter } from './AbstractHttpFilter';
import { HttpExceptionMessages } from '../enums/HttpExceptionMessages';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter extends AbstractHttpFilter {
	protected status = HttpStatus.UNAUTHORIZED;
	protected message = HttpExceptionMessages.UNAUTHORIZED;

	constructor(logAdapter: NestLogger) {
		super(logAdapter);
	}
}
