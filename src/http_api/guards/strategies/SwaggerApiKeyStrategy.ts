import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-custom";
import { securityConstants } from "../../../common/constants/securityConstants";

/**
 * Strategy for authenticating requests using an API key in the Swagger context.
 */
@Injectable()
export class SwaggerApiKeyStrategy extends PassportStrategy(Strategy, securityConstants.swaggerAuthGuardBinding) {
	constructor(private readonly configService: ConfigService) {
		super();
	}

	async validate(req: Request) {
		const swaggerHeader = securityConstants.swaggerHeader.toLowerCase();
		const apiKeyHeader = req.headers[swaggerHeader] as string;
		const expectedApiKey = this.configService.get<string>(securityConstants.swaggerEnvVar);

		if (!apiKeyHeader) {
			throw new UnauthorizedException("SwaggerApiKeyStrategy: API Key is required");
		}

		if (apiKeyHeader !== expectedApiKey) {
			throw new UnauthorizedException("SwaggerApiKeyStrategy: Invalid API Key");
		}

		return { apiKey: apiKeyHeader };
	}
}
