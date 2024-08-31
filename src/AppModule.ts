import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { FooModule } from "./foo/FooModule";
// import { LogAdapter } from "./logging/LogAdapter";
import { LoggerMiddleware } from "./middleware/LoggerMiddleware";
import { LogAdapterModule } from "./logging/LogAdapterModule";

@Module({
    imports: [LogAdapterModule, FooModule],
    controllers: [],
    providers: [],
    exports: []
})
export class AppModule implements NestModule {

    /**
     * Apply middleware to the Express App.
     */
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}