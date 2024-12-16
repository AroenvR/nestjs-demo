import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { CURRENT_JWT_VERSION, TJwtPayload } from '../../application/services/auth/AuthService';
import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as cookie from 'cookie';

/**
 * JWT strategy for authenticating users based on HTTP-Only cookies containing a JWT.
 */
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor() {
		if (!process.env.JASON_WEB_TOKEN_SECRET) throw new Error(`JWT secret is not defined`);

		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				// ExtractJwt.fromAuthHeaderAsBearerToken(),
				JwtStrategy.extractFromCookie,
			]),
			ignoreExpiration: false,
			secretOrKey: process.env.JASON_WEB_TOKEN_SECRET,
		});
	}

	/**
	 * Validates the JWT payload.
	 * @param payload The JWT payload to validate.
	 * @returns The validated payload.
	 */
	async validate(payload: TJwtPayload) {
		if (!payload) {
			console.error(`Invalid JWT payload.`);
			throw new UnauthorizedException(`Invalid JWT payload.`);
		}

		if (!payload.version || payload.version < CURRENT_JWT_VERSION) {
			console.error(`Invalid JWT version.`);
			throw new UnauthorizedException(`Invalid JWT version.`);
		}

		return {
			userId: payload.sub,
			...payload,
		};
	}

	/**
	 * Extracts the JWT from a cookie in the request headers.
	 * @param request To extract the JWT from.
	 * @returns The JWT token.
	 */
	private static extractFromCookie(request: Request) {
		if (!request.headers || !request.headers.cookie) throw new UnauthorizedException(`No cookies found in the request's headers.`);

		const cookies = cookie.parse(request.headers.cookie);
		const jwt = cookies['jwt'];

		if (!jwt) throw new UnauthorizedException(`No JWT cookie found in request headers.`);

		return jwt;
	}
}
