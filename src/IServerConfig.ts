import { ILoggerConfig } from 'ts-log-adapter';

/**
 * The application's configuration interface.
 * @property logging - The application's {@link ILoggerConfig} settings.
 */
export interface IAppConfig {
	logging: ILoggerConfig;
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
};
// TODO: import from .env and json files.
