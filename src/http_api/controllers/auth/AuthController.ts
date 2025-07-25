import { Response } from "express";
import { isTruthy } from "ts-istruthy";
import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	InternalServerErrorException,
	Patch,
	Post,
	Request,
	Res,
	UnauthorizedException,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "../../../application/services/auth/AuthService";
import { TokenService } from "../../../application/services/auth/TokenService";
import { DefaultErrorDecorators } from "../../../http_api/decorators/DefaultErrorDecorators";
import { UseErrorFilters } from "../../../http_api/decorators/UseErrorFilters";
import { ILogger } from "../../../common/utility/logging/ILogger";
import { IServerConfig } from "../../../infrastructure/configuration/IServerConfig";
import { CreateLoginDto } from "../../../http_api/dtos/login/CreateLoginDto";
import { ICreateAuthTokenData, INestJSBearerJwt, INestJSCookieJwt } from "../../../common/interfaces/JwtInterfaces";
import { UserService } from "../../../application/services/user/UserService";
import { UserResponseDto } from "../../../http_api/dtos/user/UserResponseDto";
import { TransformResponseDto } from "../../../http_api/decorators/TransformResponseDto";
import { HttpExceptionMessages } from "../../../common/enums/HttpExceptionMessages";
import { securityConstants } from "../../../common/constants/securityConstants";
import { BearerTokenAuthGuard } from "../../../http_api/guards/BearerTokenAuthGuard";
import { RefreshCookieAuthGuard } from "../../guards/RefreshCookieAuthGuard";
import { CompositeAuthGuard } from "../../../http_api/guards/CompositeAuthGuard";
import { Utilities } from "../../../common/utility/Utilities";

const ENDPOINT = "auth";

/**
 * This controller is responsible for handling authentication-related endpoints.
 * It provides methods for user login, retrieving user information,
 * refreshing tokens, and logging out users.
 */
@Controller(ENDPOINT)
@ApiTags(ENDPOINT)
@UseErrorFilters()
export class AuthController {
	public readonly name: string;
	protected readonly logger: ILogger;
	protected readonly configService: ConfigService;

	constructor(
		protected readonly utilities: Utilities,
		protected readonly authService: AuthService,
		protected readonly tokenService: TokenService,
		protected readonly userService: UserService,
	) {
		this.name = this.constructor.name;
		this.logger = this.utilities.logAdapter.getPrefixedLogger(this.name);
		this.configService = this.utilities.configService;
	}

	/**
	 * Public route for user login.
	 * Authenticates a user and returns an access token and/or sets a refresh token cookie.
	 * @param data The login credentials provided by the user.
	 * @param response The HTTP response object used to set cookies.
	 * @returns A string indicating success or an access token if bearer authentication is enabled.
	 */
	@Post("login")
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: `Authenticate a user` })
	@ApiResponse({ status: HttpStatus.CREATED, description: `The user was successfully authenticated.`, type: String })
	@DefaultErrorDecorators()
	// Public route
	public async login(@Body() data: CreateLoginDto, @Res({ passthrough: true }) response: Response) {
		this.logger.log(`User attempting to log in.`);
		if (!isTruthy(data)) throw new BadRequestException(`${this.name}: Create payload is empty.`);

		const config = this.configService.getOrThrow<IServerConfig["security"]>("security");
		if (!config?.bearer?.enabled && !config?.accessCookie?.enabled) {
			throw new InternalServerErrorException(`${this.name}: Bearer tokens OR Bearer cookies must be configured.`);
		}

		const user = await this.authService.authenticate(data);
		const tokenData: ICreateAuthTokenData = {
			sub: user.uuid,
			roles: [], // TODO: Set user roles if applicable
		};

		if (config?.refreshCookie?.enabled) {
			const httpOnlyCookie = await this.tokenService.createRefreshCookie(tokenData);
			response.cookie(securityConstants.refreshCookieString, httpOnlyCookie, {
				httpOnly: true,
				sameSite: "strict",
				secure: config.refreshCookie.secure,
				maxAge: config.refreshCookie.expiry,
			});
		}

		if (config?.accessCookie?.enabled) {
			const accessCookie = await this.tokenService.createAccessCookie(tokenData);
			response.cookie(securityConstants.accessCookieString, accessCookie, {
				httpOnly: true,
				sameSite: "strict",
				secure: config.accessCookie.secure,
				maxAge: config.accessCookie.expiry,
			});
		}

		if (config?.bearer?.enabled) return this.tokenService.createAccessToken(tokenData);
		return "success";
	}

	/**
	 * Retrieves the authenticated user's information.
	 * This endpoint is protected and requires a valid JWT (Bearer) access token.
	 * @param request The request object containing the user's JWT.
	 * @returns The user's information as a UserResponseDto.
	 */
	@Get("whoami")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: `Get the authenticated user's information` })
	@ApiResponse({ status: HttpStatus.OK, description: `The authenticated user's information.`, type: UserResponseDto })
	@DefaultErrorDecorators()
	@UseGuards(BearerTokenAuthGuard)
	@TransformResponseDto(UserResponseDto)
	public async whoAmI(@Request() request: INestJSBearerJwt) {
		if (!isTruthy(request?.user?.sub)) throw new UnauthorizedException(`${this.name}: Missing JWT information for whoami request.`);

		const uuid = request.user.sub;
		this.logger.log(`Retrieving information for user ${uuid}`);

		return await this.userService.findOne(uuid);
	}

	/**
	 * Updates an existing session by refreshing the JWT and cookie.
	 * This endpoint is protected and requires a valid HTTP-only cookie.
	 * @param request The request object containing the user's HTTP-only cookie.
	 * @param response The HTTP response object used to set cookies.
	 * @returns A string indicating success or a new access token if bearer authentication is enabled.
	 */
	@Patch("refresh")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: `Update an existing session` })
	@ApiResponse({ status: HttpStatus.OK, description: "Request handled successfully.", type: String })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: HttpExceptionMessages.NOT_FOUND })
	@DefaultErrorDecorators()
	@UseGuards(RefreshCookieAuthGuard)
	public async refresh(@Request() request: INestJSCookieJwt, @Res({ passthrough: true }) response: Response) {
		if (!isTruthy(request?.user)) throw new UnauthorizedException(`${this.name}: Missing JWT information for refresh request.`);

		this.logger.log(`Refreshing token and cookie for ${request.user.jti}`);

		const config = this.configService.get<IServerConfig["security"]>("security");
		const user = await this.authService.findUserByCookie(request.user);

		if (config?.refreshCookie.enabled) {
			const refreshedCookie = await this.tokenService.rotateRefreshToken(request.user);
			response.cookie(securityConstants.refreshCookieString, refreshedCookie, {
				httpOnly: true,
				sameSite: "strict",
				secure: config.refreshCookie.secure,
				maxAge: config.refreshCookie.expiry,
			});
		}

		const tokenData: ICreateAuthTokenData = {
			sub: user.uuid,
			roles: [], // TODO: Set user roles if applicable
		};

		if (config?.accessCookie?.enabled) {
			const accessCookie = await this.tokenService.createAccessCookie(tokenData);
			response.cookie(securityConstants.accessCookieString, accessCookie, {
				httpOnly: true,
				sameSite: "strict",
				secure: config.accessCookie.secure,
				maxAge: config.accessCookie.expiry,
			});
		}

		if (config?.bearer?.enabled) return this.tokenService.createAccessToken(tokenData);
		return "success";
	}

	/**
	 * Deletes the user's tokens and clears the refresh cookie.
	 * This endpoint is protected and requires a valid JWT (Bearer) access token.
	 * @param request The request object containing the user's JWT.
	 * @param response The HTTP response object used to clear cookies.
	 * @returns A void response indicating successful logout.
	 */
	@Delete("logout")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: `Delete the user's tokens` })
	@ApiResponse({ status: HttpStatus.NO_CONTENT, description: "Request handled successfully." })
	@DefaultErrorDecorators()
	@UseGuards(CompositeAuthGuard)
	// Public route
	public async logout(@Request() request: INestJSBearerJwt, @Res({ passthrough: true }) response: Response) {
		response.clearCookie(securityConstants.refreshCookieString);
		response.clearCookie(securityConstants.accessCookieString);

		if (!isTruthy(request?.user?.sub)) throw new BadRequestException(`${this.name}: Missing JWT information for logout request.`);
		this.logger.log(`Revoking token and cookie for user ${request.user.sub}`);

		await this.tokenService.revokeRefreshToken(request.user);
	}
}
