import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { PassportJwtStrategy } from "../../guards/strategies/PassportJwtStrategy";
import { SwaggerApiKeyStrategy } from "../../../http_api/guards/strategies/SwaggerApiKeyStrategy";
import { securityConstants } from "../../../common/constants/securityConstants";
import { PassportJwtAuthGuard } from "../../../http_api/guards/PassportJwtAuthGuard";
import { SwaggerApiKeyAuthGuard } from "../../../http_api/guards/SwaggerApiKeyAuthGuard";
import { CompositeAuthGuard } from "../../../http_api/guards/CompositeAuthGuard";
import { AuthController } from "../../../http_api/controllers/auth/AuthController";
import { AuthService } from "../../../application/services/auth/AuthService";
import { TokenService } from "../../../application/services/auth/TokenService";
import { TypeOrmEntityModule } from "../../../infrastructure/database/TypeOrmEntityModule";
import { UserModule } from "../user/UserModule";

if (!process.env[securityConstants.jwtEnvVar]) throw new Error("JWT secret is not defined");
if (!process.env[securityConstants.swaggerEnvVar]) throw new Error("Swagger API key is not defined");

@Module({
	imports: [
		TypeOrmEntityModule,
		UserModule,
		PassportModule,
		JwtModule.register({
			global: true,
			secret: process.env[securityConstants.jwtEnvVar],
		}),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		TokenService,
		PassportJwtStrategy,
		SwaggerApiKeyStrategy,
		PassportJwtAuthGuard,
		SwaggerApiKeyAuthGuard,
		CompositeAuthGuard,
	],
	exports: [PassportModule],
})
export class AuthModule {}
