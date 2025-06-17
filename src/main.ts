import dotenv from "dotenv";
dotenv.config();
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./infrastructure/AppModule";
import { BadRequestException, ValidationError, ValidationPipe, VersioningType } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { HttpErrorFilter } from "./http_api/filters/http_error/HttpErrorFilter";
import { WinstonAdapter } from "./infrastructure/logging/adapters/WinstonAdapter";
import { serverConfig } from "./infrastructure/configuration/serverConfig";

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
		Implement a custom session storage

		Fix:
		- Login scripts (scripts dir)
		- Bash scripts for /session endpoints (scripts dir)
	*/

	// !!! IF ANY CHANGES ARE MADE HERE !!!
	// Please update the createMockAppModule file in the /src/__tests__/mocks/module directory.

	const app = await NestFactory.create(AppModule, {
		bufferLogs: true,
	});

	// const logger = app.get(NestLogger); // Retrieve the custom logger from Nest's DI container
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

	app.enableCors(serverConfig().security.cors);

	// Enable API versioning
	app.enableVersioning({
		type: VersioningType.URI, // Use URI versioning type
		defaultVersion: "1", // Set the default version to '1'
		// Use the @Version decorator to specify the version of the controller or endpoint.
	});

	const swaggerConfig = new DocumentBuilder() // By default located at http://localhost:3000/api
		.setTitle("NestJS Template API")
		.setDescription("The NestJS template API Swagger documentation")
		.setVersion("1.0")
		// .addBearerAuth() // TODO
		// .addCookieAuth('jwt', {
		//     type: 'http',
		//     in: 'Header',
		//     scheme: 'Bearer'
		// })
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

	await app.listen(process.env.NEST_PORT || 3069); // Config object?
}
bootstrap();
