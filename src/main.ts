import dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';
import { LogAdapter } from './logging/LogAdapter';

async function bootstrap() {
	// TODO's:
	/*
        Implement middlewares for cors, helmet, rate limit, sanitizing, JWT validation, cookie validation
        Implement a Task manager
        Implement a Queue manager
        Implement a few abstract classes such as for DTO's and Entities
        Implement a validator utility
        Implement worker threads
        Implement a custom session storage
        Create custom errors
    */

	const app = await NestFactory.create(AppModule, {
		bufferLogs: true,
	});

	const logger = app.get(LogAdapter); // Retrieve the custom logger from Nest's DI container
	app.useLogger(logger); // Set the custom logger for the entire application

	await app.listen(3000);
}
bootstrap();
