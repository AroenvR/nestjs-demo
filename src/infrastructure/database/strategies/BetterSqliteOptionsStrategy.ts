import { DatabaseDrivers, TDatabaseConfig } from "../TDatabaseConfig";
import { ITypeOrmOptionsStrategy } from "./ITypeOrmOptionsStrategy";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

/**
 * The Better-Sqlite3 database options strategy.
 * @implements ITypeOrmOptionsStrategy
 */
export class BetterSqliteOptionsStrategy implements ITypeOrmOptionsStrategy {
	public readonly driver = DatabaseDrivers.BETTER_SQLITE3;

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
