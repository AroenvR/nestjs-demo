import { Controller, HttpCode, HttpStatus, NotImplementedException, Post } from '@nestjs/common';
import { AbstractLoggingClass } from '../abstract/AbstractLoggingClass';
import { LogAdapter } from '../logging/LogAdapter';

/**
 * A controller class that provides authentication endpoints.
 */
@Controller('auth')
export class AuthController extends AbstractLoggingClass {
	constructor(protected readonly logAdapter: LogAdapter) {
		super(logAdapter);
	}

	@HttpCode(HttpStatus.OK)
	@Post('login')
	public async login() {
		this.logger.critical('Login endpoint not implemented');
		throw new NotImplementedException('Poop...');
	}
}
