import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import { TDatabaseConfig } from "../database/TDatabaseConfig";
import { ILoggerConfig } from "../logging/ILoggerConfig";

/**
 * The server's cookie configuration interface.
 * @property version - The version of the cookie configuration.
 * @property secure - A boolean flag indicating whether the cookie is secure (only sent over HTTPS).
 * @property expiry - The expiry time of the cookie in milliseconds.
 */
export interface ICookieConfig {
	enabled: boolean;
	version: number;
	secure: boolean;
	expiry: number;
	// http-only is always true.
	// sameSite is always "strict",
}

/**
 * The server's bearer authentication configuration interface.
 * @property enabled - A boolean flag indicating whether Bearer authentication is enabled.
 * @property header - The name of the header used for Bearer authentication.
 */
export interface IBearerAuthenticationConfig {
	enabled: boolean;
	header: string;
}

/**
 * The server's security configuration interface.
 * @property cookie - The server's {@link ICookieConfig} settings.
 * @property cors - The server's {@link https://docs.nestjs.com/security/cors} settings.
 */
export type TSecurityConfig = {
	cookie: ICookieConfig;
	cors: CorsOptions;
	bearer: IBearerAuthenticationConfig;
};

/**
 * The server's miscellaneous configuration interface.
 * @property appStatusInterval - The interval in milliseconds for checking the application status.
 */
export interface IMiscellaneousConfig {
	appStatusInterval: number;
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
