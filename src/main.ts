import dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';
import { LogAdapter } from './logging/LogAdapter';

async function bootstrap() {
    // TODO's:
    /*
        Implement JWT authentication
        Create middlewares for:
        - Validating JWT tokens
        - Rate limiting
        - Sanitizing input
        - CORS
        - Helmet
        - Cookie validation
        
        Create Websockets
        Create a microservice for RabbitMQ
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

    await app.listen(3000);
}
bootstrap();
