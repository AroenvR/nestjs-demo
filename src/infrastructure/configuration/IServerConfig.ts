import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import { TDatabaseConfig } from "../database/TDatabaseConfig";
import { ILoggerConfig } from "../logging/ILoggerConfig";
import { TSupportedAesAlgorithms } from "../../common/utility/aes/TSupportedAesAlgorithms";

/**
 * The server's cookie configuration interface.
 * @property version - The version of the cookie configuration.
 * @property secure - A boolean flag indicating whether the cookie is secure (only sent over HTTPS).
 * @property expiry - The expiry time of the cookie in milliseconds.
 */
export interface ICookieAuthConfig {
	enabled: boolean;
	version: number;
	secure: boolean;
	expiry: number; // in seconds
	maxAge: number; // in milliseconds
	// http-only is always true
	// sameSite is always "strict"
}

/**
 * The server's bearer authentication configuration interface.
 * @property enabled - A boolean flag indicating whether Bearer authentication is enabled.
 * @property header - The name of the header used for Bearer authentication.
 */
export interface IBearerAuthConfig {
	enabled: boolean;
	header: string;
	encryption: TSupportedAesAlgorithms;
	expiry: number; // in seconds
}

/**
 * The server's Swagger authentication configuration interface.
 * @property enabled - A boolean flag indicating whether Swagger authentication is enabled.
 */
export interface ISwaggerAuthConfig {
	enabled: boolean;
}

/**
 * The server's security configuration interface.
 * @property cookie - The server's {@link ICookieAuthConfig} settings.
 * @property cors - The server's {@link https://docs.nestjs.com/security/cors} settings.
 */
export type TSecurityConfig = {
	cookie: ICookieAuthConfig;
	bearer: IBearerAuthConfig;
	swagger: ISwaggerAuthConfig;
	cors: CorsOptions;
};

export interface ICacheConfig {
	ttl: number;
	refreshThreshold: number;
	nonBlocking: boolean;
}

/**
 * The server's miscellaneous configuration interface.
 * @property appStatusInterval - The interval in milliseconds for checking the application status.
 */
export interface IMiscellaneousConfig {
	appStatusInterval: number;
	cache: ICacheConfig;
}

/**
 * The server's configuration interface.
 * @property security - The server's {@link TSecurityConfig} settings.
 * @property logging - The server's {@link ILoggerConfig} settings.
 * @property database - The server's {@link TDatabaseConfig} settings.
 */
export interface IServerConfig {
	security: TSecurityConfig;
	logging: ILoggerConfig;
	database: TDatabaseConfig;
	misc: IMiscellaneousConfig;
}
