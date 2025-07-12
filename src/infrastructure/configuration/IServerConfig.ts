import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import { TDatabaseConfig } from "../database/TDatabaseConfig";
import { ILoggerConfig } from "../logging/ILoggerConfig";
import { TSupportedAesAlgorithms } from "../../common/utility/aes/TSupportedAesAlgorithms";
import { Algorithm } from "jsonwebtoken";
import { IExternalConfig } from "src/external/IExternalConfig";

/**
 * The server's cookie configuration interface.
 * @property enabled - Whether this auth scheme should be enabled or not.
 * @property version - The version of the cookie configuration.
 * @property secure - A boolean flag indicating whether the cookie is secure (only sent over HTTPS).
 * @property expiry - The expiry time of the cookie in milliseconds.
 * @property maxAge - The maximum age a HTTP-Only Cookie is allowed to have.
 */
export interface ICookieAuthConfig {
	enabled: boolean;
	version: number;
	secure: boolean;
	expiry: number; // in milliseconds
	// http-only is always true
	// sameSite is always "strict"
}

/**
 * The server's bearer authentication configuration interface.
 * @property enabled - Whether this auth scheme should be enabled or not.
 * @property header - The name of the header used for Bearer authentication.
 * @property encryption - Which AES scheme should be used to encrypt access tokens.
 * @property expiry - The duration an access token is valid for.
 */
export interface IBearerAuthConfig {
	enabled: boolean;
	header: string;
	encryption: TSupportedAesAlgorithms;
	expiry: number; // in seconds
}

/**
 * Configuration for JWT validation using a JSON Web Key Set (JWKS).
 * @property enabled - Whether this auth scheme should be enabled or not.
 * @property cache - Whether to cache JWKS responses to reduce network calls.
 * @property cacheMaxEntries -
 * @property cacheMaxAge -
 * @property rateLimit - Whether to enforce rate limiting when fetching JWKS.
 * @property timeout -
 * @property jwtksPerMinute - Maximum number of JWKS fetch operations per minute.
 * @property jwksUri - URI of the JWKS endpoint from which to fetch public keys.
 * @property requestAgent - Optionally provide a PEM file as a custom trusted cert.
 * @property issuer - Expected `iss` (issuer) claim in incoming JWTs.
 * @property audience - Expected `aud` (audience) claim in incoming JWTs.
 * @property algorithms - List of allowed JWT signing algorithms (e.g. `['RS256']`).
 */
export interface IJwksAuthConfig {
	enabled: boolean;
	cache: boolean;
	cacheMaxEntries: number;
	cacheMaxAge: number;
	rateLimit: boolean;
	timeout: number;
	jwtksPerMinute: number;
	jwksUri: string;
	requestAgentCertPath?: string;
	issuer: string;
	audience: string;
	algorithms: Algorithm[];
}

/**
 * The server's Swagger authentication configuration interface.
 * @property enabled - Whether this auth scheme should be enabled or not.
 */
export interface ISwaggerAuthConfig {
	enabled: boolean;
}

/**
 * The server's security configuration interface.
 * @property cookie - The server's HTTP-Only Cookie configuration.
 * @property bearer - The server's access token configuration.
 * @property jwtks - The server's optional JSON Web Key Set configuration.
 * @property swagger - The server's swagger authentication configuration.
 * @property cors - The server's {@link https://docs.nestjs.com/security/cors} config.
 */
export interface ISecurityConfig {
	cookie: ICookieAuthConfig;
	bearer: IBearerAuthConfig;
	jwks?: IJwksAuthConfig;
	swagger: ISwaggerAuthConfig;
	cors: CorsOptions;
}

/**
 * The server's cache configuration.
 * @property ttl - The default Time-To-Live of a cached item before it's deleted.
 * @property refreshThreshold - The default
 * @property nonBlocking - Whether a cache check should be a blocking operation or not.
 */
export interface ICacheConfig {
	ttl: number;
	refreshThreshold: number;
	nonBlocking: boolean;
}

/**
 * The server's miscellaneous configuration interface.
 * @property appStatusInterval - The interval in milliseconds for checking the application status.
 * @property cache - The server's cache configuration.
 */
export interface IMiscellaneousConfig {
	appStatusInterval: number;
	cache: ICacheConfig;
}

/**
 * The server's complete configuration interface.
 * @property security - The server's {@link ISecurityConfig} settings.
 * @property logging - The server's {@link ILoggerConfig} settings.
 * @property database - The server's {@link TDatabaseConfig} settings.
 * @property misc - The server's {@link IMiscellaneousConfig} settings.
 */
export interface IServerConfig {
	security: ISecurityConfig;
	logging: ILoggerConfig;
	database: TDatabaseConfig;
	misc: IMiscellaneousConfig;
	external: IExternalConfig[]; // TODO: CREATE ARRAY, DYNAMIC JSON SCHEMA AND LOADING
}
