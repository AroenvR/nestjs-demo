import { DatabaseDrivers, TDatabaseConfig } from "../TDatabaseConfig";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

/**
 * The database options strategy interface.
 * @property driver - The database driver based on the {@link DatabaseDrivers} enum.
 */
export interface ITypeOrmOptionsStrategy {
	driver: DatabaseDrivers;

	/**
	 * Creates TypeORM module options based on the provided server configuration.
	 * @param config The server configuration object.
	 * @returns The TypeORM module options.
	 * @throws Error if a faulty driver was provided to the strategy.
	 */
	createOptionsObject(config: TDatabaseConfig, logging: boolean): TypeOrmModuleOptions;
}
