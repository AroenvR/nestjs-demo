import { ILoggerConfig } from 'ts-log-adapter';
import { TDatabaseConfig } from './database/TDatabaseConfig';

/**
 * The application's configuration interface.
 * @property logging - The application's {@link ILoggerConfig} settings.
 */
export interface IAppConfig {
	logging: ILoggerConfig;
	database: TDatabaseConfig;
}

/**
 * The application's default / fallback configuration settings.
 */
export const defaultServerConfig: IAppConfig = {
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
