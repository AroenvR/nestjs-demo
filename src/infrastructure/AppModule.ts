import { APP_INTERCEPTOR } from "@nestjs/core";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { LoggerMiddleware } from "../http_api/middleware/LoggerMiddleware";
import { DatabaseModule } from "../domain/database/DatabaseModule";
import { AuthModule } from "../http_api/modules/auth/AuthModule";
import { serverConfig } from "./configuration/serverConfig";
import { UserModule } from "../http_api/modules/user/UserModule";
import { UtilityModule } from "../common/utility/UtilityModule";
import { AppStatusModule } from "../http_api/modules/app_status/AppStatusModule";
import { TransformResponseInterceptor } from "../http_api/interceptors/TransformResponseInterceptor";

const ENDPOINT_MODULES = [UserModule, AppStatusModule];

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [serverConfig],
		}),
		ScheduleModule.forRoot(),
		DatabaseModule,
		AuthModule,
		UtilityModule,
		...ENDPOINT_MODULES,
	],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useClass: TransformResponseInterceptor,
		},
	],
})
/**
 * The root application module.
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
