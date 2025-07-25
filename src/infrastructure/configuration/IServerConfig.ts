import { IExternalConfig } from "./interfaces/IExternalConfig";
import { ILoggerConfig } from "./interfaces/ILoggerConfig";
import { IMiscellaneousConfig } from "./interfaces/IMiscellaneousConfig";
import { ISecurityConfig } from "./interfaces/ISecurityConfig";
import { TDatabaseConfig } from "./types/TDatabaseConfig";

/**
 * The server's complete configuration interface.
 * Please check the individual interfaces for a better understanding of what they represent.
 * @property security - The server's {@link ISecurityConfig} settings.
 * @property logging - The server's {@link ILoggerConfig} settings.
 * @property database - The server's {@link TDatabaseConfig} settings.
 * @property misc - The server's {@link IMiscellaneousConfig} settings.
 * @property external - The server's {@link IExternalConfig} settings.
 * Extends a Record of <string | symbol, unknown> to ensure NestJS ConfigService compatibility.
 */
export interface IServerConfig extends Record<string | symbol, unknown> {
	security: ISecurityConfig;
	logging: ILoggerConfig;
	database: TDatabaseConfig;
	misc: IMiscellaneousConfig;
	external: IExternalConfig[];
}
