import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { CURRENT_JWT_VERSION, TJwtPayload } from '../AuthService';
import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as cookie from 'cookie';

/**
 * JWT strategy for authenticating users.
 * Supports JWT tokens in the Authorization Bearer header and in cookies.
 */
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor() {
		console.log(`Creating JWT strategy.`);
		if (!process.env.JASON_WEB_TOKEN_SECRET) throw new Error(`JWT secret is not defined`);

		super({
			jwtFromRequest: ExtractJwt.fromExtractors([ExtractJwt.fromAuthHeaderAsBearerToken(), JwtStrategy.extractFromCookie]),
			ignoreExpiration: false,
			secretOrKey: process.env.JASON_WEB_TOKEN_SECRET,
		});
	}

	async validate(payload: TJwtPayload) {
		console.log(`Validating JWT payload.`);

		if (!payload) {
			console.error(`Invalid JWT payload.`);
			throw new UnauthorizedException(`Invalid JWT payload.`);
		}

		if (!payload.version || payload.version < CURRENT_JWT_VERSION) {
			console.error(`Invalid JWT version.`);
			throw new UnauthorizedException(`Invalid JWT version.`);
		}

		console.info(`Successfully validated JWT payload.`);
		return {
			userId: payload.sub,
			...payload,
		};
	}

	private static extractFromCookie(request: Request) {
		console.log(`Extracting JWT from cookie.`);
		if (!request.headers || !request.headers.cookie) throw new UnauthorizedException(`No cookies found in the request's headers.`);

		console.info(`Found a cookie in request headers.`);
		const cookies = cookie.parse(request.headers.cookie);
		const jwt = cookies['jwt'];

		if (!jwt) throw new UnauthorizedException(`No JWT cookie found in request headers.`);

		console.info(`Successfully extracted JWT from cookie.`);
		return jwt;
	}
}
