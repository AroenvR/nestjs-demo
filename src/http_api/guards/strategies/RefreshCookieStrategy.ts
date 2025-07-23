import { Request } from "express";
import * as cookie from "cookie";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { securityConstants } from "../../../common/constants/securityConstants";
import { IHttpOnlyCookie } from "../../../common/interfaces/JwtInterfaces";
import { CacheManagerAdapter } from "../../../common/utility/cache/CacheManagerAdapter";
import { CacheKeys } from "../../../common/enums/CacheKeys";

/**
 * Passport strategy refresh HTTP-Only cookies.
 * This strategy extracts the JWT from the request headers or cookies and validates it.
 * If the JWT is valid, it returns the payload; otherwise, it throws an UnauthorizedException.
 */
@Injectable()
export class RefreshCookieStrategy extends PassportStrategy(Strategy, securityConstants.refreshCookieGuardBinding) {
	constructor(
		private readonly configService: ConfigService,
		private readonly cache: CacheManagerAdapter,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([RefreshCookieStrategy.extractFromCookie]),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>(securityConstants.refreshCookieEnvVar),
		});
	}

	/**
	 * Validates the JWT payload.
	 * @param payload The JWT payload to validate.
	 * @returns The validated payload.
	 */
	async validate(payload: IHttpOnlyCookie) {
		if (!payload || !payload.jti) throw new UnauthorizedException(`Invalid JWT payload.`);

		const cachedJti = await this.cache.get<boolean>(CacheKeys.JWT_JTI + payload.jti);
		if (!cachedJti) throw new UnauthorizedException(`JWT Identifier does not exist in cache.`);

		return payload;
	}

	/**
	 * Extracts the JWT from a cookie in the request headers.
	 * @param request To extract the JWT from.
	 * @returns The JWT token.
	 */
	private static extractFromCookie(request: Request) {
		if (!request.headers || !request.headers.cookie) throw new UnauthorizedException(`No JWT Cookie found in headers.`);

		const cookies = cookie.parse(request.headers.cookie);
		const jwt = cookies[securityConstants.refreshCookieString];
		if (!jwt) throw new UnauthorizedException(`No JWT cookie found in request headers.`);

		return jwt;
	}
}
