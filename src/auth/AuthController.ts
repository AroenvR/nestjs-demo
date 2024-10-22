import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, Res, UseFilters, UseGuards } from '@nestjs/common';
import { AbstractLoggingClass } from '../abstract/AbstractLoggingClass';
import { LogAdapter } from '../logging/LogAdapter';
import { AuthService, TSignInData } from './AuthService';
import { PassportJwtAuthGuard } from './guards/PassportJwtAuthGuard';
import { Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../filters/HttpExceptionFilter';
import { UnauthorizedExceptionFilter } from '../filters/UnauthorizedExceptionFilter';
import { HttpExceptionMessages } from '../filters/HttpExceptionMessages';
import { ConfigService } from '@nestjs/config';
import { IServerConfig } from 'src/server_config/IServerConfig';

/**
 * A controller class that provides authentication endpoints.
 */
@Controller('auth')
@UseFilters(HttpExceptionFilter, UnauthorizedExceptionFilter)
@ApiTags('auth') // TODO
export class AuthController extends AbstractLoggingClass {
	constructor(
		protected readonly logAdapter: LogAdapter,
		protected readonly authService: AuthService,
		protected readonly configService: ConfigService<IServerConfig>,
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
	@ApiOperation({ summary: 'Request a HTTP-only JWT cookie' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Login successful' })
	@ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: HttpExceptionMessages.INTERNAL_SERVER_ERROR })
	public async login(@Body() data: TSignInData, @Res({ passthrough: true }) response: Response): Promise<any> {
		this.logger.info(`Logging in user ${data.username}`);

		const result = await this.authService.login(data);

		const securityConfig = this.configService.get<IServerConfig['security']>('security');
		response.cookie('jwt', result.accessToken, { secure: securityConfig.secure_cookie, httpOnly: true }); // Expires TODO

		return result.accessToken;
	}

	/**
	 * todo
	 */
	@Post('logout')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Destroy the session' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Logout successful' })
	@ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: HttpExceptionMessages.INTERNAL_SERVER_ERROR })
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
	@ApiOperation({ summary: 'Check your session state' })
	@ApiResponse({ status: HttpStatus.I_AM_A_TEAPOT, description: 'Request handled successfully' })
	@ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: HttpExceptionMessages.INTERNAL_SERVER_ERROR })
	@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: HttpExceptionMessages.UNAUTHORIZED })
	public async checkTokenInfo(@Request() request): Promise<any> {
		this.logger.info(`User with sessionId ${request.user.sessionId} is requesting their token.`);

		delete request.user.sessionId;
		return request.user;
	}
}
