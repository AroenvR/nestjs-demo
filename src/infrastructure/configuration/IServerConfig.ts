import { TDatabaseConfig } from '../database/TDatabaseConfig';
import { ILoggerConfig } from '../logging/ILoggerConfig';

/**
 * The server's security configuration interface.
 * @property secure_cookie - A boolean flag indicating whether cookies are allowed over HTTP.
 */
type TSecurityConfig = {
	secure_cookie: boolean;
};

/**
 * The server's configuration interface.
 * @property logging - The server's {@link ILoggerConfig} settings.
 * @property database - The server's {@link TDatabaseConfig} settings.
 */
export interface IServerConfig {
	security: TSecurityConfig;
	logging: ILoggerConfig;
	database: TDatabaseConfig;
}
