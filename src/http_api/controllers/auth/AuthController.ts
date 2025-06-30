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
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";
import { ILogger } from "../../../infrastructure/logging/ILogger";
import { IServerConfig } from "../../../infrastructure/configuration/IServerConfig";
import { CreateLoginDto } from "../../../http_api/dtos/login/CreateLoginDto";
import { ICreateAuthTokenData, INestJSBearerJwt, INestJSCookieJwt } from "../../../common/interfaces/JwtInterfaces";
import { UserService } from "../../../application/services/user/UserService";
import { UserResponseDto } from "../../../http_api/dtos/user/UserResponseDto";
import { TransformResponseDto } from "../../../http_api/decorators/TransformResponseDto";
import { HttpExceptionMessages } from "../../../common/enums/HttpExceptionMessages";
import { securityConstants } from "../../../common/constants/securityConstants";
import { BearerTokenAuthGuard } from "../../../http_api/guards/BearerTokenAuthGuard";
import { HttpOnlyCookieAuthGuard } from "../../../http_api/guards/HttpOnlyCookieAuthGuard";

// TODO: Create a Redis middleware with revoked JTI's

const ENDPOINT = "auth";

/**
 * This controller is responsible for handling authentication-related endpoints.
 */
@Controller(ENDPOINT)
@ApiTags(ENDPOINT)
@UseErrorFilters()
export class AuthController {
	private readonly name: string;
	protected logger: ILogger;

	constructor(
		protected readonly logAdapter: WinstonAdapter,
		protected readonly configService: ConfigService,
		protected readonly authService: AuthService,
		protected readonly tokenService: TokenService,
		protected readonly userService: UserService,
	) {
		this.name = this.constructor.name;
		this.logger = this.logAdapter.getPrefixedLogger(this.name);
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

		const user = await this.authService.authenticate(data);
		if (!user) throw new UnauthorizedException(`${this.name}: Authentication failed.`);

		const tokenData: ICreateAuthTokenData = {
			sub: user.uuid,
			roles: [], // TODO: Set user roles if applicable
		};

		const config = this.configService.get<IServerConfig["security"]>("security");
		if (config.cookie.enabled) {
			const httpOnlyCookie = await this.tokenService.createHttpOnlyCookie(tokenData);
			response.cookie(securityConstants.refreshCookieString, httpOnlyCookie, {
				httpOnly: true,
				sameSite: "strict",
				secure: config.cookie.secure,
				maxAge: config.cookie.maxAge,
			});
		}

		if (!config.bearer.enabled) return "success";
		return this.tokenService.createAccessToken(tokenData);
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
	@TransformResponseDto(UserResponseDto)
	@UseGuards(BearerTokenAuthGuard)
	public async whoAmI(@Request() request: INestJSBearerJwt) {
		if (!isTruthy(request?.user?.sub)) throw new UnauthorizedException(`${this.name}: Missing JWT information for whoami request.`);

		const uuid = request.user.sub;
		this.logger.log(`Retrieving information for user ${uuid}`);

		const user = await this.userService.findOne(uuid);
		if (!user) throw new BadRequestException(`${this.name}: User ${uuid} not found`);

		return user;
	}

	/**
	 *
	 * @param request
	 * @param response
	 */
	@Patch("refresh")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: `Update an existing session` })
	@ApiResponse({ status: HttpStatus.OK, description: "Request handled successfully.", type: String })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: HttpExceptionMessages.NOT_FOUND })
	@DefaultErrorDecorators()
	@UseGuards(HttpOnlyCookieAuthGuard)
	public async refresh(@Request() request: INestJSCookieJwt, @Res({ passthrough: true }) response: Response) {
		if (!isTruthy(request?.user)) throw new UnauthorizedException(`${this.name}: Missing JWT information for refresh request.`);

		this.logger.log(`Refreshing token and cookie for ${request.user.jti}`);

		const config = this.configService.get<IServerConfig["security"]>("security");
		const user = await this.authService.findUserByCookie(request.user);

		if (config.cookie.enabled) {
			const refreshedCookie = await this.tokenService.rotateRefreshToken(request.user);
			response.cookie(securityConstants.refreshCookieString, refreshedCookie, {
				httpOnly: true,
				sameSite: "strict",
				secure: config.cookie.secure,
				maxAge: config.cookie.maxAge,
			});
		}

		if (!config.bearer.enabled) return "success";

		const tokenData: ICreateAuthTokenData = {
			sub: user.uuid,
			roles: [], // TODO: Set user roles if applicable
		};
		return this.tokenService.createAccessToken(tokenData);
	}

	@Delete("logout")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: `Delete the user's tokens` })
	@ApiResponse({ status: HttpStatus.NO_CONTENT, description: "Request handled successfully." })
	@DefaultErrorDecorators()
	// Public route
	public async logout(@Request() request: INestJSBearerJwt, @Res({ passthrough: true }) response: Response) {
		response.clearCookie(securityConstants.refreshCookieString);

		if (!isTruthy(request?.user?.sub)) throw new BadRequestException(`${this.name}: Missing JWT information for logout request.`);
		this.logger.log(`Revoking token and cookie for user ${request.user.sub}`);

		return this.tokenService.revokeRefreshToken(request.user);
	}
}
