import { Strategy } from "passport-custom";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { securityConstants } from "../../../common/constants/securityConstants";
import { IServerConfig } from "../../../infrastructure/configuration/IServerConfig";

/**
 * Strategy for authenticating requests using an API key in the Swagger context.
 */
@Injectable()
export class SwaggerApiKeyStrategy extends PassportStrategy(Strategy, securityConstants.swaggerAuthGuardBinding) {
	constructor(private readonly configService: ConfigService) {
		super();
	}

	async validate(req: Request) {
		const config = this.configService.get<IServerConfig["security"]>("security").swagger;
		if (!config || !config.enabled) throw new UnauthorizedException("SwaggerApiKeyStrategy: Swagger authentication is disabled");

		const swaggerHeader = securityConstants.swaggerHeader.toLowerCase();
		const apiKeyHeader = req.headers[swaggerHeader] as string;

		if (!apiKeyHeader) {
			throw new UnauthorizedException("SwaggerApiKeyStrategy: API Key is required");
		}

		const expectedApiKey = this.configService.get<string>(securityConstants.swaggerEnvVar);
		if (apiKeyHeader !== expectedApiKey) {
			throw new UnauthorizedException("SwaggerApiKeyStrategy: Invalid API Key");
		}

		return { apiKey: apiKeyHeader };
	}
}
