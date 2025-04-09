import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { TDatabaseConfig } from '../database/TDatabaseConfig';
import { ILoggerConfig } from '../logging/ILoggerConfig';

/**
 * The server's cookie configuration interface.
 * @property version - The version of the cookie configuration.
 * @property secure - A boolean flag indicating whether the cookie is secure (only sent over HTTPS).
 * @property expiry - The expiry time of the cookie in milliseconds.
 */
export interface ICookieConfig {
	version: number;
	secure: boolean;
	expiry: number;
	// http-only is always true.
}

/**
 * The server's security configuration interface.
 * @property cookie - The server's {@link ICookieConfig} settings.
 * @property cors - The server's {@link https://docs.nestjs.com/security/cors} settings.
 */
export type TSecurityConfig = {
	cookie: ICookieConfig;
	cors: CorsOptions;
};

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
}
