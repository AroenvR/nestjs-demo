import { TDatabaseConfig } from "../../../infrastructure/configuration/types/TDatabaseConfig";
import { DatabaseDrivers } from "../DatabaseDrivers";
import { ITypeOrmOptionsStrategy } from "./ITypeOrmOptionsStrategy";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

/**
 * The SQLite database options strategy.
 * @implements ITypeOrmOptionsStrategy
 */
export class SqlcipherOptionsStrategy implements ITypeOrmOptionsStrategy {
	public readonly driver = DatabaseDrivers.SQLCIPHER;

	/**
	 *
	 */
	public createOptionsObject(config: TDatabaseConfig, logging: boolean): TypeOrmModuleOptions {
		if (config.driver !== this.driver)
			throw new Error(`${this.constructor.name}: Invalid driver - expected ${this.driver}, got ${config.driver}`);

		const DATABASE_ENCRYPTION_KEY = process.env.DATABASE_ENCRYPTION_KEY;
		if (!DATABASE_ENCRYPTION_KEY) throw new Error(`${this.constructor.name}: SQLCipher key is required for database encryption.`);

		return {
			type: DatabaseDrivers.SQLITE, // SQLCipher uses SQLite under the hood.
			database: config.database,
			key: DATABASE_ENCRYPTION_KEY,
			synchronize: config.synchronize,
			autoLoadEntities: true,
			logging: logging,
		};
	}
}
