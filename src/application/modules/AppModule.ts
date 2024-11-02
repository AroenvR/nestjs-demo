import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from '../../common/middleware/LoggerMiddleware';
import { LoggerModule } from '../../infrastructure/logging/LoggerModule';
import { DatabaseModule } from '../../infrastructure/database/DatabaseModule';
import { TemplateModule } from './TemplateModule';
import { AuthModule } from './AuthModule';
import { ConfigModule } from '@nestjs/config';
import { serverConfig } from '../../infrastructure/configuration/serverConfig';

const ENDPOINT_MODULES = [AuthModule, TemplateModule];

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [serverConfig],
		}),
		LoggerModule,
		DatabaseModule,
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
		consumer.apply(LoggerMiddleware).forRoutes('*'); // LoggerMiddleware has to come first to ensure a correlationId is set
	}
}
