import { Global, Module } from "@nestjs/common";
import { LogAdapter } from "./LogAdapter";
import { CorrelationManager, LoggerConfigurator, LoggerFactory } from "ts-log-adapter";
import { defaultServerConfig } from "../IServerConfig";

// const defaultConfig: ILoggerConfig = {
//     appName: 'NestJS_API',
//     driver: 'winston',
//     enableCorrelation: true,
//     level: 'verbose',
//     console: true,
//     file: {
//         enabled: false,
//     },
//     http: {
//         enabled: false,
//     },
//     useWhitelist: false,
//     prefixWhitelist: [],
// }

@Global()
@Module({
    providers: [
        {
            provide: LogAdapter,
            useFactory: () => {
                const correlationManager = new CorrelationManager();
                const config = new LoggerConfigurator({ loader: 'object', config: defaultServerConfig.logging }).loadConfiguration();
                const logger = new LoggerFactory().initialize(config, correlationManager);
                return new LogAdapter(logger);
            },
        },
    ],
    exports: [LogAdapter],
})
export class LoggerModule { } // TODO: Document & Test