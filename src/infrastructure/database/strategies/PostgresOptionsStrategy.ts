import { DatabaseDrivers, TDatabaseConfig } from '../TDatabaseConfig';
import { ITypeOrmOptionsStrategy } from './ITypeOrmOptionsStrategy';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * The Postgres database options strategy.
 * @implements ITypeOrmOptionsStrategy
 */
export class PostgresOptionsStrategy implements ITypeOrmOptionsStrategy {
	public readonly driver = DatabaseDrivers.POSTGRES;

	/**
	 *
	 */
	public createOptionsObject(config: TDatabaseConfig, logging: boolean): TypeOrmModuleOptions {
		if (config.driver !== this.driver)
			throw new Error(`${this.constructor.name}: Invalid driver - expected ${this.driver}, got ${config.driver}`);

		return {
			type: this.driver,
			database: config.database,
			host: config.host,
			port: config.port,
			username: config.username,
			password: config.password,
			synchronize: config.synchronize,
			autoLoadEntities: true,
			logging: logging,
		};
	}
}
