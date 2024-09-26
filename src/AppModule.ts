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
export class AppModule implements NestModule {
	// TODO: Document & Test

	/**
	 * Apply middleware to the Express App.
	 */
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(LoggerMiddleware).forRoutes('*'); // LoggerMiddleware has to come first to ensure a correlationId is set
	}
}
