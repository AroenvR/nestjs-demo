import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { FooModule } from "./foo/FooModule";
import { LoggerMiddleware } from "./middleware/LoggerMiddleware";
import { LoggerModule } from "./logging/LoggerModule";
import { APP_FILTER } from "@nestjs/core";
import { AllExceptionsFilter } from "./filters/AllExceptionsFilter";

const exceptionFilterProvider = {
    provide: APP_FILTER,
    useClass: AllExceptionsFilter,
}

@Module({
    imports: [LoggerModule, FooModule],
    controllers: [],
    providers: [
        exceptionFilterProvider,
    ],
    exports: []
})
export class AppModule implements NestModule { // TODO: Document & Test

    /**
     * Apply middleware to the Express App.
     */
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}