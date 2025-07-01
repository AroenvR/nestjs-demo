import { randomUUID, UUID } from "crypto";
import { Response } from "express";
import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	HttpCode,
	HttpException,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Request,
	Res,
	UnauthorizedException,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { isTruthy } from "ts-istruthy";
import { CreateSessionDto } from "../../dtos/session/CreateSessionDto";
import { SessionResponseDto } from "../../dtos/session/SessionResponseDto";
import { SessionService } from "../../../application/services/session/SessionService";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";
import { DefaultErrorDecorators } from "../../../http_api/decorators/DefaultErrorDecorators";
import { UseErrorFilters } from "../../../http_api/decorators/UseErrorFilters";
import { ILogger } from "../../../infrastructure/logging/ILogger";
import { TJwtCookie, TRequest } from "../../../common/types/TJwtCookie";
import { ICookieAuthConfig, IServerConfig } from "../../../infrastructure/configuration/IServerConfig";
import { HttpExceptionMessages } from "../../../common/enums/HttpExceptionMessages";
import { PublicRoute } from "../../../http_api/decorators/PublicRoute";
import { CompositeAuthGuard } from "../../guards/CompositeAuthGuard";

const ENDPOINT = "session";

/**
 * A controller class that handles session-related operations.
 * It provides endpoints for creating, updating, and deleting sessions.
 */
@Controller(ENDPOINT)
@ApiTags(ENDPOINT)
@UseErrorFilters()
@UseGuards(CompositeAuthGuard)
export class SessionController {
	protected logger: ILogger;

	constructor(
		protected readonly logAdapter: WinstonAdapter,
		protected readonly sessionService: SessionService,
		protected readonly jwtService: JwtService,
		protected readonly configService: ConfigService<IServerConfig>,
	) {
		this.logger = this.logAdapter.getPrefixedLogger(this.constructor.name);
	}

	/**
	 * Creates a new session for the user.
	 * @param createDto The DTO containing the user credentials.
	 * @param response The HTTP response object.
	 * @returns A {@link SessionResponseDto} along with an HTTP-Only JWT cookie.
	 */
	@Post("login")
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: `Create a new session` })
	@ApiResponse({ status: HttpStatus.CREATED, description: `The session was successfully created.`, type: SessionResponseDto })
	@DefaultErrorDecorators()
	@PublicRoute()
	public async login(@Body() createDto: CreateSessionDto, @Res({ passthrough: true }) response: Response) {
		this.logger.log(`Logging a user in.`);
		if (!isTruthy(createDto)) throw new BadRequestException(`${this.constructor.name}: Create payload is empty.`);

		const config = this.configService.get<IServerConfig["security"]>("security").cookie;

		const dto = await this.sessionService.create(createDto);
		const token = await this.createAndSignJwt(dto, config);

		response.cookie("jwt", token, {
			httpOnly: true,
			sameSite: "strict",
			secure: config.secure,
			maxAge: config.expiry,
		});

		return dto;
	}

	/**
	 * Refreshes the session and JWT for the user.
	 * @param uuid The UUID of the session to refresh.
	 * @param request The HTTP request object.
	 * @param response The HTTP response object.
	 * @returns A {@link SessionResponseDto} with the updated session information.
	 */
	@Patch("refresh/:uuid")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: `Update an existing session` })
	@ApiResponse({ status: HttpStatus.OK, description: "Request handled successfully.", type: SessionResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: HttpExceptionMessages.NOT_FOUND })
	@DefaultErrorDecorators()
	public async update(@Param("uuid", ParseUUIDPipe) uuid: UUID, @Request() request: TRequest, @Res({ passthrough: true }) response: Response) {
		this.logger.info(`Updating session and JWT for user uuid ${uuid}`);

		if (!isTruthy(request.user)) throw new UnauthorizedException("Missing JWT");
		if (!isTruthy(uuid)) throw new HttpException("UUID parameter is empty", HttpStatus.BAD_REQUEST);

		const config = this.configService.get<IServerConfig["security"]>("security").cookie;

		try {
			const dto = await this.sessionService.update(uuid);
			const token = await this.createAndSignJwt(dto, config);

			response.cookie("jwt", token, {
				httpOnly: true,
				sameSite: "strict",
				secure: config.secure,
				maxAge: config.expiry,
			});

			return dto;
		} catch (err) {
			this.logger.error(`Error updating Session for user uuid ${uuid}`, err);

			if (err instanceof UnauthorizedException) {
				await this.sessionService.remove(uuid);
				response.clearCookie("jwt");
			}

			throw err;
		}
	}

	/**
	 * Logs the user out by removing the session from the database and clearing the JWT cookie.
	 * @param request The HTTP request object.
	 * @param response The HTTP response object.
	 * @returns A 204 No Content response.
	 */
	@Delete("logout")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: `Delete the user's session` })
	@ApiResponse({ status: HttpStatus.NO_CONTENT, description: "Request handled successfully." })
	@DefaultErrorDecorators()
	@PublicRoute()
	public async logout(@Request() request: TRequest, @Res({ passthrough: true }) response: Response) {
		this.logger.log(`Logging a user out.`);

		response.clearCookie("jwt");

		if (!isTruthy(request.user)) {
			this.logger.critical(`Missing JWT.`);
			return;
		}

		const uuid = request.user.uuid;
		if (uuid) {
			try {
				const exists = await this.sessionService.exists(uuid);
				if (exists) await this.sessionService.remove(uuid);
			} catch (err) {
				this.logger.info(`Session for user uuid ${uuid} does not exist:`, err);
			}
		}

		this.logger.info(`Logged out user with uuid ${uuid}`);
		return;
	}

	/**
	 * Creates and signs a JWT cookie for the user.
	 * @param responseDto The session response DTO containing user information.
	 * @param config The cookie configuration.
	 * @returns A signed JWT token.
	 */
	private async createAndSignJwt(responseDto: SessionResponseDto, config: ICookieAuthConfig) {
		this.logger.info(`Creating JWT for user uuid ${responseDto.uuid}`);

		const now = Date.now();
		const tokenPayload: TJwtCookie = {
			uuid: responseDto.uuid,
			username: responseDto.username,
			uniquefier: randomUUID(),
			iat: now,
			exp: now + config.expiry,
		};

		this.logger.debug(`Signing JWT.`);
		return this.jwtService.signAsync(tokenPayload);
	}
}
