import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './middleware/LoggerMiddleware';
import { LoggerModule } from './logging/LoggerModule';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/AllExceptionsFilter';
import { DatabaseModule } from './database/DatabaseModule';
import { TemplateModule } from './template/TemplateModule';

@Module({
	imports: [LoggerModule, DatabaseModule, TemplateModule],
	controllers: [],
	providers: [
		{
			provide: APP_FILTER,
			useClass: AllExceptionsFilter,
		},
	],
	exports: [],
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
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(LoggerMiddleware).forRoutes('*'); // LoggerMiddleware has to come first to ensure a correlationId is set
	}
}
