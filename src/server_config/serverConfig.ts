import path from 'path';
import fs from 'fs-extra';
import { IServerConfig } from './IServerConfig';
import { serverJsonSchema } from './serverJsonSchema';

/**
 * The application's default / fallback configuration settings.
 */
const defaultConfig: IServerConfig = {
	security: {
		secure_cookie: true,
	},
	logging: {
		appName: 'NestJS_API',
		driver: 'winston',
		enableCorrelation: true,
		level: 'info',
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

/**
 * Server configuration settings for the application.
 */
export const serverConfig = (): IServerConfig => {
	let config = {};

	// Load JSON configuration
	try {
		const loggerConfigPath = path.resolve(process.env.LOGSCRIBE_CONFIG);
		const loggerConfigData = fs.readFileSync(loggerConfigPath, 'utf8');
		const loggerConfig = JSON.parse(loggerConfigData);

		const databaseConfigPath = path.resolve(process.env.DATABASE_CONFIG);
		const databaseConfigData = fs.readFileSync(databaseConfigPath, 'utf8');
		const databaseConfig = JSON.parse(databaseConfigData);

		const securityConfigPath = path.resolve(process.env.SECURITY_CONFIG);
		const securityConfigData = fs.readFileSync(securityConfigPath, 'utf8');
		const securityConfig = JSON.parse(securityConfigData);

		config = {
			logging: loggerConfig,
			database: databaseConfig,
			security: securityConfig,
		};
	} catch (error: Error | unknown) {
		console.error(`serverConfig: Could not load server configuration, using default fallback configuration: ${error}`);
		config = defaultConfig;
	}

	// Validate the final configuration
	const { error, value } = serverJsonSchema.validate(config, {
		abortEarly: false,
	});

	if (error) {
		throw new Error(`Configuration validation error: ${error.message}`);
	}

	return value;
};
