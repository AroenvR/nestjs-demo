import { Global, Module } from "@nestjs/common";
import { LogAdapter } from "./LogAdapter";
import { ILoggerConfig, LoggerConfigurator, LoggerFactory } from "ts-log-adapter";

const defaultConfig: ILoggerConfig = { // TODO: Get from config file.
    appName: 'NestJS_API',
    driver: 'winston',
    enableCorrelation: true,
    level: 'verbose',
    console: true,
    file: {
        enabled: false,
    },
    http: {
        enabled: false,
    },
    useWhitelist: false,
    prefixWhitelist: [],
}

@Global()
@Module({
    providers: [
        {
            provide: LogAdapter,
            useFactory: () => {
                const config = new LoggerConfigurator({ loader: 'object', config: defaultConfig }).loadConfiguration();
                const logger = new LoggerFactory().initialize(config);
                return new LogAdapter(logger);
            },
        },
    ],
    exports: [LogAdapter],
})
export class LoggerModule { } // TODO: Document & Test