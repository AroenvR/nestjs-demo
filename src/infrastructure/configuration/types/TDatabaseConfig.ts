import { DatabaseDrivers } from "../../../domain/database/DatabaseDrivers";

/**
 * The database configuration object based on the driver.
 */
export type TDatabaseConfig =
	| {
			driver: DatabaseDrivers.SQLITE | DatabaseDrivers.BETTER_SQLITE3 | DatabaseDrivers.SQLCIPHER;
			database: string;
			synchronize: boolean;
	  }
	| {
			driver: DatabaseDrivers.POSTGRES;
			database: string;
			host: string;
			port: number;
			username: string;
			password: string;
			synchronize: boolean;
	  };
