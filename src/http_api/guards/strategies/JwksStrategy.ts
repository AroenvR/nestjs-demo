import fs from "fs-extra";
import https from "https";
import jwksRsa from "jwks-rsa";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { securityConstants } from "../../../common/constants/securityConstants";
import { IServerConfig } from "../../../infrastructure/configuration/IServerConfig";

/**
 * TODO: Document & test
 */
@Injectable()
export class JwksStrategy extends PassportStrategy(Strategy, securityConstants.jwksBinding) {
	constructor(private readonly configService: ConfigService) {
		const config = configService.get<IServerConfig["security"]>("security").jwks;

		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKeyProvider: jwksRsa.passportJwtSecret({
				cache: config.cache,
				cacheMaxEntries: config.cacheMaxEntries,
				cacheMaxAge: config.cacheMaxAge,
				rateLimit: config.rateLimit,
				timeout: config.timeout,
				jwksRequestsPerMinute: config.jwtksPerMinute,
				jwksUri: config.jwksUri,
				requestAgent: config.requestAgentCertPath
					? new https.Agent({
							ca: fs.readFileSync(config.requestAgentCertPath),
						})
					: undefined,
			}),
			issuer: config.issuer,
			audience: config.audience,
			algorithms: config.algorithms,
		});
	}

	validate(payload: any) {
		console.log(`WIP PAYLOAD`, payload);
		// Optionally confirm payload.sub matches a user record, etc.
		return { sub: payload.sub, roles: payload.realm_access?.roles || [] };
	}
}
