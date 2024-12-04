import { BadRequestException, Type, ValidationError, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { serverConfig } from '../../../infrastructure/configuration/serverConfig';
import { LoggerModule } from '../../../infrastructure/logging/LoggerModule';
import { DatabaseModule } from '../../../infrastructure/database/DatabaseModule';
import { AuthModule } from '../../../application/modules/auth/AuthModule';
import { HttpErrorFilter } from '../../../common/filters/HttpErrorFilter';
import { NewWinstonAdapter } from '../../../infrastructure/logging/adapters/NewWinstonAdapter';

/**
 * Mocks the app module for testing.
 * @param module To test.
 * @returns The app module.
 */
export const createMockAppModule = async (module: Type<any>) => {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [
			ConfigModule.forRoot({
				isGlobal: true,
				load: [serverConfig],
			}),
			LoggerModule,
			DatabaseModule,
			AuthModule,
			module,
		],
	}).compile();

	const app = moduleFixture.createNestApplication({ bufferLogs: true });

	const logger = app.get(NewWinstonAdapter); // Retrieve the custom logger from Nest's DI container
	app.useLogger(logger); // Set the custom logger for the entire application

	// Apply global filters to ensure we catch any uncaught errors.
	app.useGlobalFilters(new HttpErrorFilter(logger));

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true, // Strips away any properties that do not have a corresponding DTO property
			exceptionFactory: (errors: ValidationError[]) => {
				return new BadRequestException(`DTO validation failed: ${errors.map((error) => error.toString()).join(', ')}`);
			},
		}),
	);

	// Enable API versioning
	app.enableVersioning({
		type: VersioningType.URI, // Use URI versioning type
		defaultVersion: '1', // Set the default version to '1'
		// Use the @Version decorator to specify the version of the controller or endpoint.
	});

	await app.init();
	return app;
};
