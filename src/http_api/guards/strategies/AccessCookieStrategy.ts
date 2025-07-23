import { Request } from "express";
import * as cookie from "cookie";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { securityConstants } from "../../../common/constants/securityConstants";
import { IAccessCookie } from "../../../common/interfaces/JwtInterfaces";
import { CacheManagerAdapter } from "../../../common/utility/cache/CacheManagerAdapter";
import { CacheKeys } from "../../../common/enums/CacheKeys";

/**
 * Passport strategy using HTTP-Only JWT Access Cookies.
 */
@Injectable()
export class AccessCookieStrategy extends PassportStrategy(Strategy, securityConstants.accessCookieBinding) {
	constructor(
		private readonly configService: ConfigService,
		private readonly cache: CacheManagerAdapter,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([AccessCookieStrategy.extractFromCookie]),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>(securityConstants.accessCookieEnvVar),
		});
	}

	/**
	 * Validates the JWT payload.
	 * @param payload The JWT payload to validate.
	 * @returns The validated payload.
	 */
	async validate(payload: IAccessCookie) {
		if (!payload) throw new UnauthorizedException(`No JWT payload found.`);
		if (!payload.jti || !payload.sub) throw new UnauthorizedException(`Invalid JWT type.`);

		const cachedJti = await this.cache.get<boolean>(CacheKeys.JWT_JTI + payload.jti);
		if (!cachedJti) throw new UnauthorizedException(`JWT Identifier does not exist in cache.`);

		const userExists = await this.cache.get<boolean>(CacheKeys.USER_UUID + payload.sub);
		if (!userExists) throw new UnauthorizedException(`Subject does not exist in cache.`);

		return payload;
	}

	/**
	 * Extracts the JWT from a cookie in the request headers.
	 * @param request To extract the JWT from.
	 * @returns The JWT token.
	 */
	private static extractFromCookie(request: Request) {
		if (!request.headers || !request.headers.cookie) throw new UnauthorizedException(`No Access Cookie found in headers.`);

		const cookies = cookie.parse(request.headers.cookie);
		const jwt = cookies[securityConstants.accessCookieString];
		if (!jwt) throw new UnauthorizedException(`No Access Cookie found in request headers.`);

		return jwt;
	}
}
