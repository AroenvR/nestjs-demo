import { BadRequestException, Type, ValidationError, ValidationPipe, VersioningType } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { serverConfig } from "../../../infrastructure/configuration/serverConfig";
import { LoggerModule } from "../../../infrastructure/logging/LoggerModule";
import { DatabaseModule } from "../../../infrastructure/database/DatabaseModule";
import { AuthModule } from "../../../http_api/modules/auth/AuthModule";
import { HttpErrorFilter } from "../../../http_api/filters/http_error/HttpErrorFilter";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";
import { UtilityModule } from "../../../common/utility/UtilityModule";
import { AppModule } from "../../../infrastructure/AppModule";
import { IServerConfig } from "../../../infrastructure/configuration/IServerConfig";

/**
 * Optional options for adjusting the created mock app module.
 */
type TCreateMockAppModuleOptions = {
	/**
	 * If true, the application will listen on a random port after creation.
	 * If a number is provided, it will listen on that port.
	 */
	listen?: boolean | number;

	/**
	 * If provided, this configuration will overwrite the default server configuration.
	 */
	serverConfig?: IServerConfig;
};

/**
 * Mocks the app module for testing.
 * @param module To test.
 * @returns The app module.
 */
export const createMockAppModule = async (module?: Type<any>, opts?: TCreateMockAppModuleOptions) => {
	let moduleFixture: TestingModule;
	const config: IServerConfig = opts?.serverConfig ?? serverConfig();

	if (!module) {
		moduleFixture = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
	} else {
		moduleFixture = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({
					isGlobal: true,
					load: [() => config],
				}),
				LoggerModule,
				DatabaseModule,
				UtilityModule,
				AuthModule,
				module,
			],
		}).compile();
	}

	const app = moduleFixture.createNestApplication({ bufferLogs: true });

	const logger = app.get(WinstonAdapter); // Retrieve the custom logger from Nest's DI container
	app.useLogger(logger); // Set the custom logger for the entire application

	// Apply global filters to ensure we catch any uncaught errors.
	app.useGlobalFilters(new HttpErrorFilter(logger));

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true, // Strips away any properties that do not have a corresponding DTO property
			exceptionFactory: (errors: ValidationError[]) => {
				return new BadRequestException(`DTO validation failed: ${errors.map((error) => error.toString()).join(", ")}`);
			},
		}),
	);

	app.enableCors(serverConfig().security.cors);

	// Enable API versioning
	app.enableVersioning({
		type: VersioningType.URI, // Use URI versioning type
		defaultVersion: "1", // Set the default version to '1'
		// Use the @Version decorator to specify the version of the controller or endpoint.
	});

	if (opts?.listen) {
		let port = 0;
		if (typeof opts.listen === "number") port = opts.listen;

		await app.listen(port);
	}

	await app.init();
	return app;
};
