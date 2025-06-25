import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { LoggerMiddleware } from "../http_api/middleware/LoggerMiddleware";
import { LoggerModule } from "./logging/LoggerModule";
import { DatabaseModule } from "./database/DatabaseModule";
import { AuthModule } from "../http_api/modules/auth/AuthModule";
import { ConfigModule } from "@nestjs/config";
import { serverConfig } from "./configuration/serverConfig";
import { UserModule } from "../http_api/modules/user/UserModule";
import { UtilityModule } from "../common/utility/UtilityModule";
import { SessionModule } from "../http_api/modules/session/SessionModule";
import { AppStatusModule } from "../http_api/modules/app_status/AppStatusModule";

const ENDPOINT_MODULES = [UserModule, SessionModule, AppStatusModule];

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [serverConfig],
		}),
		LoggerModule,
		DatabaseModule,
		AuthModule,
		UtilityModule,
		...ENDPOINT_MODULES,
	],
})
/**
 * The root application module.
 * - Applies global middlewares.
 * - Exposes Configuration, Logging and Database modules to the other modules.
 */
export class AppModule implements NestModule {
	/**
	 * Apply middleware to the Express App.
	 * @param consumer - The middleware consumer to apply middleware.
	 */
	public configure(consumer: MiddlewareConsumer) {
		consumer.apply(LoggerMiddleware).forRoutes("*"); // LoggerMiddleware has to come first to ensure a correlationId is set
	}
}
