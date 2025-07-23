import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { SwaggerApiKeyStrategy } from "../../../http_api/guards/strategies/SwaggerApiKeyStrategy";
import { securityConstants } from "../../../common/constants/securityConstants";
import { SwaggerApiKeyAuthGuard } from "../../../http_api/guards/SwaggerApiKeyAuthGuard";
import { CompositeAuthGuard } from "../../../http_api/guards/CompositeAuthGuard";
import { AuthController } from "../../../http_api/controllers/auth/AuthController";
import { AuthService } from "../../../application/services/auth/AuthService";
import { TokenService } from "../../../application/services/auth/TokenService";
import { TypeOrmEntityModule } from "../../../infrastructure/database/TypeOrmEntityModule";
import { UserModule } from "../user/UserModule";
import { RefreshCookieAuthGuard } from "../../guards/RefreshCookieAuthGuard";
import { BearerTokenStrategy } from "../../../http_api/guards/strategies/BearerTokenStrategy";
import { BearerTokenAuthGuard } from "../../../http_api/guards/BearerTokenAuthGuard";
import { JwksStrategy } from "../../../http_api/guards/strategies/JwksStrategy";
import { JwksAuthGuard } from "../../../http_api/guards/JwksAuthGuard";
import { AccessCookieAuthGuard } from "../../guards/AccessCookieAuthGuard";
import { AccessCookieStrategy } from "../../guards/strategies/AccessCookieStrategy";
import { RefreshCookieStrategy } from "../../../http_api/guards/strategies/RefreshCookieStrategy";
// TODO: test
if (!process.env[securityConstants.refreshCookieEnvVar]) throw new Error("HTTP-Only Cookie secret is not defined");
if (!process.env[securityConstants.bearerAccessTokenEnvVar]) throw new Error("Bearer Token secret is not defined");
if (!process.env[securityConstants.accessCookieEnvVar]) throw new Error("SSE Cookie secret is not defined");
if (!process.env[securityConstants.swaggerEnvVar]) throw new Error("Swagger API key is not defined");

@Module({
	imports: [
		TypeOrmEntityModule,
		UserModule,
		PassportModule,
		JwtModule.register({
			global: true,
		}),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		TokenService,
		BearerTokenStrategy,
		BearerTokenAuthGuard,
		RefreshCookieStrategy,
		RefreshCookieAuthGuard,
		AccessCookieStrategy,
		AccessCookieAuthGuard,
		JwksStrategy,
		JwksAuthGuard,
		SwaggerApiKeyStrategy,
		SwaggerApiKeyAuthGuard,
		CompositeAuthGuard,
	],
	exports: [PassportModule],
})
export class AuthModule {}
