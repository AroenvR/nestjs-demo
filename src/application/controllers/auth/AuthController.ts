import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { IServerConfig } from '../../../infrastructure/configuration/IServerConfig';
import { HttpExceptionFilter } from '../../../common/filters/HttpExceptionFilter';
import { UnauthorizedExceptionFilter } from '../../../common/filters/UnauthorizedExceptionFilter';
import { AuthService, TSignInData } from '../../services/auth/AuthService';
import { HttpExceptionMessages } from '../../../common/enums/HttpExceptionMessages';
import { PassportJwtAuthGuard } from '../../../common/guards/PassportJwtAuthGuard';
import { ILogger } from '../../../infrastructure/logging/ILogger';
import { NewWinstonAdapter } from '../../../infrastructure/logging/adapters/NewWinstonAdapter';

/**
 * A controller class that provides authentication endpoints.
 */
@Controller('auth')
@UseFilters(HttpExceptionFilter, UnauthorizedExceptionFilter)
@ApiTags('auth') // TODO
export class AuthController {
	private logger: ILogger;

	constructor(
		protected readonly logAdapter: NewWinstonAdapter,
		protected readonly authService: AuthService,
		protected readonly configService: ConfigService<IServerConfig>,
	) {
		this.logger = logAdapter.getPrefixedLogger(this.constructor.name);
	}

	/**
	 * todo
	 * @param request
	 * @returns
	 */
	@Post('login')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Request an HTTP-only JWT cookie' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Login successful' })
	@ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: HttpExceptionMessages.INTERNAL_SERVER_ERROR })
	public async login(@Body() data: TSignInData, @Res({ passthrough: true }) response: Response): Promise<any> {
		this.logger.info(`Logging in user ${data.username}`);

		const result = await this.authService.login(data);

		const securityConfig = this.configService.get<IServerConfig['security']>('security');
		response.cookie('jwt', result.accessToken, { secure: securityConfig.secure_cookie, httpOnly: true }); // Expires TODO

		return 'success';
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
