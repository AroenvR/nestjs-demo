import { Request } from "express";
import * as cookie from "cookie";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { securityConstants } from "../../../common/constants/securityConstants";
import { INestJSCookieJwt } from "../../../common/interfaces/JwtInterfaces";

/**
 * Passport strategy for authenticating users using JWTs stored in HTTP-Only cookies or Bearer tokens.
 * This strategy extracts the JWT from the request headers or cookies and validates it.
 * If the JWT is valid, it returns the payload; otherwise, it throws an UnauthorizedException.
 */
@Injectable()
export class HttpOnlyCookieStrategy extends PassportStrategy(Strategy, securityConstants.httpOnlyCookieGuardBinding) {
	constructor(private readonly configService: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([HttpOnlyCookieStrategy.extractFromCookie]),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>(securityConstants.httpOnlyCookieEnvVar),
		});
	}

	/**
	 * Validates the JWT payload.
	 * @param payload The JWT payload to validate.
	 * @returns The validated payload.
	 */
	async validate(payload: INestJSCookieJwt) {
		if (payload) return payload;

		console.error(`Invalid JWT payload.`);
		throw new UnauthorizedException(`Invalid JWT payload.`);
	}

	/**
	 * Extracts the JWT from a cookie in the request headers.
	 * @param request To extract the JWT from.
	 * @returns The JWT token.
	 */
	private static extractFromCookie(request: Request) {
		if (!request.headers || !request.headers.cookie) throw new UnauthorizedException(`No JWT Cookie found in headers.`);

		const cookies = cookie.parse(request.headers.cookie);
		const jwt = cookies["jwt"];

		if (!jwt) throw new UnauthorizedException(`No JWT cookie found in request headers.`);

		return jwt;
	}
}
