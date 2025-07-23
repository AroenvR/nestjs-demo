import path from "path";
import fs from "fs-extra";
import { ConfigModule } from "@nestjs/config"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { IServerConfig } from "./IServerConfig";
import { serverJsonSchema } from "./serverJsonSchema";
import { DatabaseDrivers } from "../database/TDatabaseConfig";

/**
 * The application's default / fallback configuration settings.
 */
const defaultConfig: IServerConfig = {
	security: {
		refresh_cookie: {
			enabled: false,
			version: 1,
			secure: false,
			expiry: 57600000, // 16 hours in milliseconds
		},
		access_cookie: {
			enabled: false,
			version: 1,
			secure: false,
			expiry: 120000, // 2 minutes in milliseconds
		},
		bearer: {
			enabled: false,
			header: "Authorization",
			encryption: "aes-256-gcm",
			expiry: 900000, // 15 minutes in milliseconds
		},
		swagger: {
			enabled: false,
		},
		cors: {
			origin: ["http://localhost:3000"],
			allowedHeaders: ["Content-Type", "Authorization", "User-Agent", "X-Correlation-ID"],
			methods: ["GET"],
			credentials: true,
			maxAge: 600, // Cache preflight response for 10 minutes (in seconds)
		},
	},
	logging: {
		appName: "NestJS_API",
		driver: "winston",
		enableCorrelation: true,
		level: "info",
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
		driver: DatabaseDrivers.BETTER_SQLITE3,
		database: ":memory:",
		synchronize: false,
	},
	misc: {
		appStatusInterval: 10 * 1000, // Default to 10 seconds
		cache: {
			ttl: 5 * 60 * 1000, // Default to 5 minutes
			refreshThreshold: 30 * 1000, // Default to 30 seconds
			nonBlocking: true,
		},
	},
	external: [
		{
			key: "foo.bar.baz",
			ssl: true,
			domain: "foo.bar.baz",
			port: 443,
		},
	],
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
		const loggerConfig = fs.readFileSync(loggerConfigPath, "utf8");
		const logging = JSON.parse(loggerConfig);
		config.logging = logging;
	} catch (error: Error | unknown) {
		console.error(`serverConfig: Could not load logger configuration, using fallback configuration: ${error}`);
	}

	// Database configuration
	try {
		const databaseConfigPath = path.resolve(process.env.DATABASE_CONFIG);
		const databaseConfig = fs.readFileSync(databaseConfigPath, "utf8");
		const database = JSON.parse(databaseConfig);
		config.database = database;
	} catch (error: Error | unknown) {
		console.error(`serverConfig: Could not load database configuration, using fallback configuration: ${error}`);
	}

	// Security configuration
	try {
		const securityConfigPath = path.resolve(process.env.SECURITY_CONFIG);
		const securityConfig = fs.readFileSync(securityConfigPath, "utf8");
		const security = JSON.parse(securityConfig);
		config.security = security;
		if (!config.security.bearer.enabled && !config.security.refresh_cookie.enabled)
			throw new Error("serverConfig: No authentication scheme is enabled.");
	} catch (error: Error | unknown) {
		console.error(`serverConfig: Could not load security configuration, using fallback configuration: ${error}`);
	}

	// Miscellaneous configuration
	try {
		const miscConfigPath = path.resolve(process.env.MISC_CONFIG);
		const miscConfig = fs.readFileSync(miscConfigPath, "utf8");
		const misc = JSON.parse(miscConfig);
		config.misc = misc;
	} catch (error: Error | unknown) {
		console.error(`serverConfig: Could not load miscellanous configuration, using fallback configuration: ${error}`);
	}

	// External configuration
	try {
		const externalConfigPath = path.resolve(process.env.EXTERNAL_CONFIG);
		const externalConfig = fs.readFileSync(externalConfigPath, "utf8");
		const external = JSON.parse(externalConfig);
		config.external = external;
	} catch (error: Error | unknown) {
		console.error(`serverConfig: Could not load external configuration, using fallback configuration: ${error}`);
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
