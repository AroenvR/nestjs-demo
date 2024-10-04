import dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';
import { LogAdapter } from './logging/LogAdapter';
import { VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
	// TODO's:
	/*
        Implement Database Migrations
        Implement JWT authentication
        Create middlewares for:
        - Validating JWT tokens
        - Rate limiting
        - Sanitizing input
        - CORS
        - Helmet
        - Cookie validation
        
        Create endpoint for login / logout
        Create Websockets
        Create a microservice for RabbitMQ
        Implement Redis caching
        Implement a Task manager
        Implement a Queue manager
        Implement a validator utility
        Implement worker threads
        Implement a custom session storage
    */

	const app = await NestFactory.create(AppModule, {
		bufferLogs: true,
	});

	const logger = app.get(LogAdapter); // Retrieve the custom logger from Nest's DI container
	app.useLogger(logger); // Set the custom logger for the entire application

	// Enable API versioning
	app.enableVersioning({
		type: VersioningType.URI, // Use URI versioning type
		defaultVersion: '1', // Set the default version to '1'
		// Use the @Version decorator to specify the version of the controller or endpoint.
	});

	const swaggerConfig = new DocumentBuilder()
		.setTitle('NestJS Template API')
		.setDescription('The NestJS template API Swagger documentation')
		.setVersion('1.0')
		.build();
	const document = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup('api', app, document);

	await app.listen(process.env.NEST_PORT || 3069); // Config object?
}
bootstrap();
