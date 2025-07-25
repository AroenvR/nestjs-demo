import dotenv from "dotenv";
dotenv.config();
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./infrastructure/AppModule";
import { BadRequestException, ValidationError, ValidationPipe, VersioningType } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { HttpErrorFilter } from "./http_api/filters/http_error/HttpErrorFilter";
import { WinstonAdapter } from "./common/utility/logging/adapters/WinstonAdapter";
import { serverConfig } from "./infrastructure/configuration/serverConfig";
import { securityConstants } from "./common/constants/securityConstants";

// Left off at Auth schemes. Next step is implementing a Keycloak guard.
// Testing still needs to happen as well.

async function bootstrap() {
	// TODO's:
	/*
		Implement Database Migrations
		Create middlewares for:
		- Rate limiting
		- Sanitizing input
		- CORS => Improve by implementing a cutstom origin whitelist middleware
		- Helmet
	    
		Create Websockets
		Create a microservice for RabbitMQ
		Implement Redis caching
		Implement a Task manager
		Implement a Queue manager
		Implement a validator utility
		Implement worker threads

		Create a middleware that looks at all of the application's responses and asserts:
		- It either:
		-- Fits a DTO scheme and has the `isDto` value set to true
		-- Fits a the ErrorResponseDto scheme

		Create automated dependency documentation https://www.youtube.com/watch?v=EtTrgv1ww8o

		Create a global auth guard with specific exclusions (such as login / refresh / logout)
		Create a global error filter so controllers don't need to implement it anymore.
	*/

	// !!! IF ANY CHANGES ARE MADE HERE !!!
	// Please update the createMockAppModule file in the /src/__tests__/mocks/module directory.

	const appConfiguration = serverConfig();

	const app = await NestFactory.create(AppModule, {
		bufferLogs: true,
	});

	const logger = app.get(WinstonAdapter); // Retrieve the custom logger from Nest's DI container
	app.useLogger(logger); // Set the custom logger for the entire application

	// Apply global filters to ensure we catch any uncaught errors.
	app.useGlobalFilters(new HttpErrorFilter(logger));

	// Apply global validation pipes (JSON validation)
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true, // Strips away any properties that do not have a corresponding DTO property
			exceptionFactory: (errors: ValidationError[]) => {
				return new BadRequestException(`DTO validation failed: ${errors.map((error) => error.toString()).join(", ")}`);
			},
		}),
	);

	// Enable CORS on the server
	app.enableCors(appConfiguration.security.cors);

	// Enable API versioning
	app.enableVersioning({
		type: VersioningType.URI, // Use URI versioning type
		defaultVersion: "1", // Set the default version to 'v1'
		// Use the @Version decorator to specify the version of the controller or endpoint.
	});

	const swaggerConfig = new DocumentBuilder() // By default located at http://localhost:3000/api
		.setTitle("NestJS Template API")
		.setDescription("The NestJS template API's Swagger documentation")
		.setVersion("1.0")
		.addApiKey(
			{
				type: "apiKey",
				name: securityConstants.swaggerHeader,
				in: "header",
				description: "API Key for authentication",
			},
			securityConstants.swaggerAuthGuardBinding,
		)
		.build();

	const document = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup("api", app, document, {
		swaggerOptions: {
			requestInterceptor: (req: any) => {
				req.credentials = "include";
				return req;
			},
		},
	});

	const PORT = process.env.NEST_PORT || 3069;
	await app.listen(PORT);

	logger.log("main", `API listening on port ${PORT}`);
	logger.debug("main", `API configuration:`, appConfiguration);

	/* 
		Listen for shutdown signals to gracefully close the application
	*/

	process.on("SIGINT", async () => {
		logger.log("main", "Received SIGINT. Shutting down gracefully...");
		await app.close();

		logger.log("main", "Application has been shut down.");
		process.exit(0);
	});

	process.on("SIGTERM", async () => {
		logger.log("main", "Received SIGTERM. Shutting down gracefully...");
		await app.close();

		logger.log("main", "Application has been shut down.");
		process.exit(0);
	});
}
bootstrap();
