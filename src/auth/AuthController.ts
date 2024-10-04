import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { AbstractLoggingClass } from '../abstract/AbstractLoggingClass';
import { LogAdapter } from '../logging/LogAdapter';
import { AuthService, TJwtPayload, TSignInData } from './AuthService';
import { PassportJwtAuthGuard } from './guards/PassportJwtAuthGuard';

/**
 * A controller class that provides authentication endpoints.
 */
@Controller('auth')
export class AuthController extends AbstractLoggingClass {
	constructor(
		protected readonly logAdapter: LogAdapter,
		protected readonly authService: AuthService,
	) {
		super(logAdapter);
	}

	/**
	 *
	 * @param request
	 * @returns
	 */
	@Post('login')
	@HttpCode(HttpStatus.OK)
	public async login(@Body() data: TSignInData): Promise<any> {
		this.logger.info(`Logging in user ${data.username}`);

		return this.authService.login(data);
	}

	/**
	 *
	 * @param request
	 * @returns
	 */
	@Get('check')
	@HttpCode(HttpStatus.I_AM_A_TEAPOT)
	@UseGuards(PassportJwtAuthGuard)
	public async checkTokenInfo(@Request() request): Promise<TJwtPayload> {
		this.logger.info(`User with sessionId ${request.user.sessionId} is requesting their token`);

		return request.user;
	}
}
