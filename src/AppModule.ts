import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './middleware/LoggerMiddleware';
import { LoggerModule } from './logging/LoggerModule';
import { DatabaseModule } from './database/DatabaseModule';
import { TemplateModule } from './template/TemplateModule';
import { AuthModule } from './auth/AuthModule';

const ENDPOINT_MODULES = [TemplateModule];

@Module({
	imports: [LoggerModule, DatabaseModule, AuthModule, ...ENDPOINT_MODULES],
})
/**
 * The root application module.
 * Imports essential modules, applies global middleware, and registers global exception filters.
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
