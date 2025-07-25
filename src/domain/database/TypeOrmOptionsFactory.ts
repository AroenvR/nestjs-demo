import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { DatabaseDrivers } from "./DatabaseDrivers";
import { ITypeOrmOptionsStrategy } from "./strategies/ITypeOrmOptionsStrategy";
import { SqliteOptionsStrategy } from "./strategies/SqliteOptionsStrategy";
import { PostgresOptionsStrategy } from "./strategies/PostgresOptionsStrategy";
import { BetterSqliteOptionsStrategy } from "./strategies/BetterSqliteOptionsStrategy";
import { SqlcipherOptionsStrategy } from "./strategies/SqlcipherOptionsStrategy";
import { TDatabaseConfig } from "../../infrastructure/configuration/types/TDatabaseConfig";

/**
 * A factory class for creating database options based on the provided server configuration.
 */
export class TypeOrmOptionsFactory {
	private readonly strategies: Map<DatabaseDrivers, ITypeOrmOptionsStrategy> = new Map();

	constructor() {
		this.registerStrategies();
	}

	/**
	 * Creates TypeORM module options based on the provided server configuration.
	 * @param config The server configuration object.
	 * @returns The TypeORM module options.
	 */
	public createTypeOrmModuleOptions(config: TDatabaseConfig, logging: boolean): TypeOrmModuleOptions {
		const strategy = this.strategies.get(config.driver);
		if (!strategy) throw new Error(`${this.constructor.name}: No database strategy found for ${config.driver}`);

		return strategy.createOptionsObject(config, logging);
	}

	/**
	 * Registers the database strategies.
	 * @devnote Add new strategies here as needed.
	 */
	public registerStrategies() {
		this.strategies.set(DatabaseDrivers.SQLITE, new SqliteOptionsStrategy());
		this.strategies.set(DatabaseDrivers.BETTER_SQLITE3, new BetterSqliteOptionsStrategy());
		this.strategies.set(DatabaseDrivers.SQLCIPHER, new SqlcipherOptionsStrategy());
		this.strategies.set(DatabaseDrivers.POSTGRES, new PostgresOptionsStrategy());
	}
}
