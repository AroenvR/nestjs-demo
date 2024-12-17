import { Catch, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AbstractHttpFilter } from './AbstractHttpFilter';
import { HttpExceptionMessages } from '../../common/enums/HttpExceptionMessages';
import { NewWinstonAdapter } from '../../infrastructure/logging/adapters/NewWinstonAdapter';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter extends AbstractHttpFilter {
	protected status = HttpStatus.UNAUTHORIZED;
	protected message = HttpExceptionMessages.UNAUTHORIZED;

	constructor(logAdapter: NewWinstonAdapter) {
		super(logAdapter);
	}
}
