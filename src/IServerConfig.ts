import { ILoggerConfig } from 'ts-log-adapter';

/**
 * To document :D
 */
export interface IAppConfig {
	logging: ILoggerConfig;
}

export const defaultServerConfig: IAppConfig = {
	logging: {
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
	},
};
// TODO: import from .env and json files.
