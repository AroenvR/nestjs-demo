import { NestFactory } from '@nestjs/core';
import { FooModule } from './foo/FooModule';
import { AppModule } from './AppModule';
import { LogAdapter } from './logging/LogAdapter';

async function bootstrap() {
    // TODO's:
    /*
        Implement custom logger
        Implement middlewares for at least logging and error handling with later cors, helmet, rate limit, sanitizing, JWT validation, cookie validation
        Add linting to all test commands
        Implement a Task manager
        Implement a Queue manager
        Implement configuration loader
        Implement a few abstract classes such as for DTO's and Entities
        Implement a validator utility
        Implement worker threads
        Implement a custom session storage
        Create custom errors
        Implement a database connection repository
    */

    const app = await NestFactory.create(AppModule, {
        logger: new LogAdapter()
    });
    await app.listen(3000);
}
bootstrap();
