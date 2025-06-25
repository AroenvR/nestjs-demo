import { Request } from "express";
import * as cookie from "cookie";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { TJwtCookie } from "../../types/TJwtCookie";
import { IServerConfig } from "../../../infrastructure/configuration/IServerConfig";
import { securityConstants } from "../../../common/constants/securityConstants";

/**
 * Passport strategy for authenticating users using JWTs stored in HTTP-Only cookies or Bearer tokens.
 * This strategy extracts the JWT from the request headers or cookies and validates it.
 * If the JWT is valid, it returns the payload; otherwise, it throws an UnauthorizedException.
 */
@Injectable()
export class PassportJwtStrategy extends PassportStrategy(Strategy, securityConstants.jwtAuthGuardBinding) {
	constructor(private readonly configService: ConfigService) {
		const extractors = [];

		const config = configService.get<IServerConfig["security"]>("security");
		if (config.cookie.enabled) extractors.push(PassportJwtStrategy.extractFromCookie);
		if (config.bearer.enabled) extractors.push(ExtractJwt.fromAuthHeaderAsBearerToken());

		super({
			jwtFromRequest: ExtractJwt.fromExtractors(extractors),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>(securityConstants.jwtEnvVar),
		});
	}

	/**
	 * Validates the JWT payload.
	 * @param payload The JWT payload to validate.
	 * @returns The validated payload.
	 */
	async validate(payload: TJwtCookie): Promise<TJwtCookie> {
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
		if (!request.headers || !request.headers.cookie) return null;

		const cookies = cookie.parse(request.headers.cookie);
		const jwt = cookies["jwt"];

		if (!jwt) throw new UnauthorizedException(`No JWT cookie found in request headers.`);

		return jwt || null;
	}
}
