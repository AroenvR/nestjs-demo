import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { CURRENT_JWT_VERSION, TJwtPayload } from '../AuthService';
import { UnauthorizedException } from '@nestjs/common';

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor() {
		if (!process.env.JASON_WEB_TOKEN_SECRET) throw new Error(`JWT secret is not defined`);

		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: process.env.JASON_WEB_TOKEN_SECRET,
		});
	}

	async validate(payload: TJwtPayload) {
		if (!payload) throw new UnauthorizedException(`Invalid JWT payload`);
		if (!payload.version || payload.version < CURRENT_JWT_VERSION) throw new UnauthorizedException(`Invalid JWT version`);

		return {
			userId: payload.sub,
			...payload,
		};
	}
}
