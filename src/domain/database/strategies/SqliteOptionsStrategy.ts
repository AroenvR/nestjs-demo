import { TDatabaseConfig } from "../../../infrastructure/configuration/types/TDatabaseConfig";
import { DatabaseDrivers } from "../DatabaseDrivers";
import { ITypeOrmOptionsStrategy } from "./ITypeOrmOptionsStrategy";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

/**
 * The SQLite database options strategy.
 * @implements ITypeOrmOptionsStrategy
 */
export class SqliteOptionsStrategy implements ITypeOrmOptionsStrategy {
	public readonly driver = DatabaseDrivers.SQLITE;

	/**
	 *
	 */
	public createOptionsObject(config: TDatabaseConfig, logging: boolean): TypeOrmModuleOptions {
		if (config.driver !== this.driver)
			throw new Error(`${this.constructor.name}: Invalid driver - expected ${this.driver}, got ${config.driver}`);

		return {
			type: this.driver,
			database: config.database,
			synchronize: config.synchronize,
			autoLoadEntities: true,
			logging: logging,
		};
	}
}
