import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, Res, UseGuards } from '@nestjs/common';
import { AbstractLoggingClass } from '../abstract/AbstractLoggingClass';
import { LogAdapter } from '../logging/LogAdapter';
import { AuthService, TSignInData } from './AuthService';
import { PassportJwtAuthGuard } from './guards/PassportJwtAuthGuard';
import { Response } from 'express';

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
	 * todo
	 * @param request
	 * @returns
	 */
	@Post('login')
	@HttpCode(HttpStatus.OK)
	public async login(@Body() data: TSignInData, @Res({ passthrough: true }) response: Response): Promise<any> {
		this.logger.info(`Logging in user ${data.username}`);

		const result = await this.authService.login(data);

		response.cookie('jwt', result.accessToken, { secure: true, httpOnly: true }); // expires: ?
		return result.accessToken;
	}

	/**
	 * todo
	 */
	@Post('logout')
	@HttpCode(HttpStatus.OK)
	public async logout(@Request() request, @Res({ passthrough: true }) response: Response): Promise<any> {
		this.logger.info(`Logging out user with sessionId ${request.user.sessionId}`);

		response.clearCookie('jwt');
		return 'success';
	}

	/**
	 *
	 * @param request
	 * @returns
	 */
	@Get('check')
	@HttpCode(HttpStatus.I_AM_A_TEAPOT)
	@UseGuards(PassportJwtAuthGuard)
	public async checkTokenInfo(@Request() request): Promise<any> {
		this.logger.info(`User with sessionId ${request.user.sessionId} is requesting their token.`);

		return request.user;
	}
}
