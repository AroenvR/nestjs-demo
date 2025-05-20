import { Request } from "express";
import * as cookie from "cookie";
import { Strategy, ExtractJwt } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { TJwtCookie } from "../types/TJwtCookie";

/**
 * JWT strategy for authenticating users based on HTTP-Only cookies containing a JWT.
 */
export class OptionalJwtStrategy extends PassportStrategy(Strategy, "optional-jwt") {
	constructor() {
		if (!process.env.JASON_WEB_TOKEN_SECRET) throw new Error(`JWT secret is not defined`);

		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				// ExtractJwt.fromAuthHeaderAsBearerToken(),
				OptionalJwtStrategy.extractFromCookie,
			]),
			ignoreExpiration: true,
			secretOrKey: process.env.JASON_WEB_TOKEN_SECRET,
		});
	}

	/**
	 * Validates the JWT payload.
	 * @param payload The JWT payload to validate.
	 * @returns The validated payload.
	 */
	async validate(payload: TJwtCookie): Promise<TJwtCookie> {
		if (payload) return payload;
		return null;
	}

	/**
	 * Extracts the JWT from a cookie in the request headers.
	 * @param request To extract the JWT from.
	 * @returns The JWT token.
	 */
	private static extractFromCookie(request: Request) {
		if (!request.headers || !request.headers.cookie) return null;

		const cookies = cookie.parse(request.headers.cookie);
		const jwt = cookies["jwt"];

		if (!jwt) return null;

		return jwt;
	}
}
