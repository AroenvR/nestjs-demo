import { randomUUID } from "crypto";
import { EntityManager, Repository } from "typeorm";
import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { IBearerToken, ICreateAuthTokenData, IHttpOnlyCookie } from "../../../common/interfaces/JwtInterfaces";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";
import { ILogger } from "../../../infrastructure/logging/ILogger";
import { IServerConfig } from "../../../infrastructure/configuration/IServerConfig";
import { EncryptionUtils } from "../../../common/utility/aes/EncryptionUtils";
import { RefreshTokenEntity } from "../../../domain/refresh_token/RefreshTokenEntity";
import { securityConstants } from "../../../common/constants/securityConstants";
import { CacheManagerAdapter } from "../../../common/utility/cache/CacheManagerAdapter";
import { CacheKeys } from "../../../common/enums/CacheKeys";

/**
 * A service class that provides methods for creating/managing access tokens and HTTP-only cookies.
 */
@Injectable()
export class TokenService {
	private readonly name: string;
	protected logger: ILogger;

	constructor(
		protected readonly entityManager: EntityManager,
		protected readonly logAdapter: WinstonAdapter,
		protected readonly jwtService: JwtService,
		protected readonly configService: ConfigService,
		protected readonly encryptionUtils: EncryptionUtils,
		protected readonly cache: CacheManagerAdapter,
		@InjectRepository(RefreshTokenEntity)
		protected readonly refreshTokenRepo: Repository<RefreshTokenEntity>,
	) {
		this.name = this.constructor.name;
		this.logger = this.logAdapter.getPrefixedLogger(this.name);
	}

	/**
	 * Creates a new access token for the user.
	 * @param data The data required to create the access token, including the subject and roles.
	 * @returns A signed JWT string representing the access token.
	 */
	public async createAccessToken(data: ICreateAuthTokenData): Promise<string> {
		this.logger.info(`Creating access token.`);

		const config = this.configService.get<IServerConfig["security"]>("security").bearer;
		const iat = Math.floor(Date.now() / 1000);
		const exp = iat + config.expiry / 1000;

		const tokenInfo: IBearerToken = {
			jti: randomUUID(),
			sub: data.sub,
			roles: data.roles || [],
			iat: iat,
			exp: exp,
		};

		return this.signToken(tokenInfo);
	}

	/**
	 * Creates a new HTTP-only cookie for the user.
	 * @param data The data required to create the HTTP-only cookie, including the subject.
	 * @returns A signed JWT string representing the HTTP-only cookie.
	 */
	public async createHttpOnlyCookie(data: ICreateAuthTokenData): Promise<string> {
		this.logger.info(`Creating HTTP-only cookie.`);

		const tokenInfo = await this.createHttpOnlyCookieInfo();
		await this.createRefreshTokenEntity(data, tokenInfo);
		return this.signToken(tokenInfo);
	}

	/**
	 * Rotates the refresh token for the user.
	 * @param data The HTTP-only cookie data containing the claims.
	 * @returns A signed JWT string representing the new HTTP-only cookie.
	 */
	public async rotateRefreshToken(data: IHttpOnlyCookie): Promise<string> {
		this.logger.info(`Refreshing token ${data.jti}`);
		await this.cache.del(CacheKeys.JWT_JTI + data.jti);

		const currentTokenHash = this.encryptionUtils.sha256(JSON.stringify(data));
		const tokenEntity = await this.refreshTokenRepo.findOne({
			where: { hash: currentTokenHash },
			relations: [],
		});
		if (!tokenEntity) throw new BadRequestException(`${this.name}: Refresh token not found.`);

		const config = this.configService.get<IServerConfig["security"]>("security");

		const refreshData = await this.createHttpOnlyCookieInfo();
		const newTokenHash = this.encryptionUtils.sha256(JSON.stringify(refreshData));
		tokenEntity.refresh(refreshData.jti, newTokenHash, config.cookie.expiry, config.bearer.expiry);

		await this.entityManager.transaction(async (entityManager: EntityManager) => {
			return entityManager.save(tokenEntity);
		});

		return this.signToken(refreshData);
	}

	/**
	 * Revokes the refresh token for the user.
	 * @param data The HTTP-only cookie data containing the claims.
	 * @throws InternalServerErrorException if the token is not found.
	 */
	public async revokeRefreshToken(data: IBearerToken): Promise<void> {
		this.logger.info(`Revoking token for user ${data.sub}`);
		await this.cache.del(CacheKeys.JWT_JTI + data.jti);

		const token = await this.refreshTokenRepo.findOne({
			where: { sub: data.sub },
		});
		if (!token) throw new InternalServerErrorException(`Token for user ${data.sub} not found.`);

		await this.refreshTokenRepo.remove(token);
	}

	/**
	 * Creates a new refresh token entity in the database.
	 * @param data The data required to create the refresh token, including the subject.
	 * @param tokenInfo The HTTP-only cookie information to be hashed and stored.
	 */
	private async createRefreshTokenEntity(data: ICreateAuthTokenData, tokenInfo: IHttpOnlyCookie) {
		this.logger.info(`Creating a new refresh entity for ${data.sub}`);

		const tokenStr = JSON.stringify(tokenInfo);
		const tokenHash = this.encryptionUtils.sha256(tokenStr);

		const refreshTokenData: Partial<RefreshTokenEntity> = {
			jti: tokenInfo.jti,
			sub: data.sub,
			hash: tokenHash,
		};

		const entity = RefreshTokenEntity.create(refreshTokenData);

		await this.entityManager.transaction(async (entityManager: EntityManager) => {
			return entityManager.save(entity);
		});
	}

	/**
	 * Creates the HTTP-only cookie information with a unique identifier, issued at time, and expiration time.
	 * @returns An object containing the JTI, issued at time (iat), and expiration
	 */
	private async createHttpOnlyCookieInfo(): Promise<IHttpOnlyCookie> {
		const config = this.configService.get<IServerConfig["security"]>("security").cookie;
		const iat = Math.floor(Date.now() / 1000);
		const exp = iat + config.expiry / 1000;

		return {
			jti: randomUUID(),
			iat: iat,
			exp: exp,
		};
	}

	/**
	 * Signs the token with the JWT service.
	 * @param data The data to be signed into a JWT.
	 * @returns A signed JWT string.
	 */
	private async signToken(data: IBearerToken | IHttpOnlyCookie): Promise<string> {
		this.logger.debug(`Signing JWT: ${data.jti}`);

		// Cache value is set for the Security Guards.
		const config = this.configService.get<IServerConfig["security"]>("security");

		// Bearer Access Token
		if ("sub" in data && data.sub) {
			this.cache.set<boolean>(CacheKeys.JWT_JTI + data.jti, true, config.bearer.expiry);
			return this.jwtService.signAsync(data, {
				secret: this.configService.get<string>(securityConstants.bearerAccessTokenEnvVar),
			});
		}

		// HTTP-Only Cookie
		this.cache.set<boolean>(CacheKeys.JWT_JTI + data.jti, true, config.cookie.expiry);
		return this.jwtService.signAsync(data, {
			secret: this.configService.get<string>(securityConstants.httpOnlyCookieEnvVar),
		});
	}

	// TODO: Periodic cleanup of expired refresh tokens
	// This should also remove accepted JTI's from the cache
	// This can be implemented as a scheduled task or a background job.
}
