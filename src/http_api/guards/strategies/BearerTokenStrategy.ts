import { UUID } from "crypto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { securityConstants } from "../../../common/constants/securityConstants";
import { INestJSBearerJwt } from "../../../common/interfaces/JwtInterfaces";
import { CacheManagerAdapter } from "../../../common/utility/cache/CacheManagerAdapter";
import { CacheKeys } from "../../../common/enums/CacheKeys";

/**
 * Passport strategy for authenticating users using JWTs stored in HTTP-Only cookies or Bearer tokens.
 * This strategy extracts the JWT from the request headers or cookies and validates it.
 * If the JWT is valid, it returns the payload; otherwise, it throws an UnauthorizedException.
 */
@Injectable()
export class BearerTokenStrategy extends PassportStrategy(Strategy, securityConstants.bearerTokenBinding) {
	constructor(
		private readonly configService: ConfigService,
		private readonly cache: CacheManagerAdapter,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([ExtractJwt.fromAuthHeaderAsBearerToken()]),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>(securityConstants.bearerAccessTokenEnvVar),
		});
	}

	/**
	 * Validates the `Authorization: Bearer` header's JWT payload.
	 * @param jwt The JWT to validate.
	 * @returns The validated payload.
	 */
	async validate(jwt: INestJSBearerJwt) {
		if (!jwt || !jwt.user) throw new UnauthorizedException(`Invalid access token JWT.`);

		const cachedSub = await this.cache.get<string>(CacheKeys.JWT_JTI + jwt.user.jti);
		if (!cachedSub) throw new UnauthorizedException(`JWT Identifier does not exist in cache.`);

		const userExists = await this.cache.get<UUID>(CacheKeys.USER_UUID + jwt.user.sub);
		if (!userExists) throw new UnauthorizedException(`Subject does not exist in cache.`);

		return jwt;
	}
}
