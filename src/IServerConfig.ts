import { ILoggerConfig } from 'ts-log-adapter';
import { TDatabaseConfig } from './database/TDatabaseConfig';

/**
 * The server's configuration interface.
 * @property logging - The server's {@link ILoggerConfig} settings.
 * @property database - The server's {@link TDatabaseConfig} settings.
 */
export interface IServerConfig {
    logging: ILoggerConfig;
    database: TDatabaseConfig;
}

/**
 * The application's default / fallback configuration settings.
 */
export const defaultServerConfig: IServerConfig = {
    logging: {
        appName: 'NestJS_API',
        driver: 'winston',
        enableCorrelation: true,
        level: 'critical',
        console: true,
        file: {
            enabled: false,
        },
        http: {
            enabled: false,
        },
        useWhitelist: false,
        prefixWhitelist: [],
    },
    database: {
        driver: 'sqlite',
        database: ':memory:',
        synchronize: true,
    },
};
