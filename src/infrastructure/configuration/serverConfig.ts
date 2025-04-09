import path from 'path';
import fs from 'fs-extra';
import { ConfigModule } from '@nestjs/config'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { IServerConfig } from './IServerConfig';
import { serverJsonSchema } from './serverJsonSchema';

/**
 * The application's default / fallback configuration settings.
 */
const defaultConfig: IServerConfig = {
	security: {
		cookie: {
			version: 1,
			secure: false,
			expiry: 3600000,
		},
		cors: {
			origin: ['http://localhost:3000'],
			allowedHeaders: ['Content-Type', 'Authorization', 'User-Agent', 'X-Correlation-ID'],
			methods: ['GET'],
			credentials: true,
			maxAge: 3600, // Cache preflight response for 3600 seconds
		},
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
		database: false,
		useWhitelist: false,
		prefixWhitelist: [],
	},
	database: {
		driver: 'better-sqlite3',
		database: ':memory:',
		synchronize: true,
	},
};

/**
 * Server configuration settings for the application.
 * This function loads the default configuration settings and attempts to load JSON configuration files based on their environment variables.
 * The configuration settings are then validated against the JSON schema located at ./serverJsonSchema.ts.
 * @throws An error if the configuration settings fail validation.
 * @returns The server configuration settings to be used by NestJS's {@link ConfigModule}.
 */
export const serverConfig = (): IServerConfig => {
	// Load the default configuration
	const config = defaultConfig;

	/* Attempt to load JSON configuration files based on the environment variables */

	// Logging configuration
	try {
		const loggerConfigPath = path.resolve(process.env.LOGSCRIBE_CONFIG);
		const loggerConfig = fs.readFileSync(loggerConfigPath, 'utf8');
		const logging = JSON.parse(loggerConfig);
		config.logging = logging;
	} catch (error: Error | unknown) {
		console.error(`serverConfig: Could not load logger configuration, using fallback configuration: ${error}`);
	}

	// Database configuration
	try {
		const databaseConfigPath = path.resolve(process.env.DATABASE_CONFIG);
		const databaseConfig = fs.readFileSync(databaseConfigPath, 'utf8');
		const database = JSON.parse(databaseConfig);
		config.database = database;
	} catch (error: Error | unknown) {
		console.error(`serverConfig: Could not load database configuration, using fallback configuration: ${error}`);
	}

	// Security configuration
	try {
		const securityConfigPath = path.resolve(process.env.SECURITY_CONFIG);
		const securityConfig = fs.readFileSync(securityConfigPath, 'utf8');
		const security = JSON.parse(securityConfig);
		config.security = security;
	} catch (error: Error | unknown) {
		console.error(`serverConfig: Could not load security configuration, using fallback configuration: ${error}`);
	}

	// JSON Schema validate the complete server configuration object
	const { error, value } = serverJsonSchema.validate(config, {
		abortEarly: false,
	});

	if (error) {
		throw new Error(`serverConfig: validation error: ${error.message}`);
	}

	return value;
};
