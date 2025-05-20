/**
 * The currently supported SQLite based database drivers.
 */
export enum SqliteDatabaseDrivers {
	SQLITE = "sqlite",
	BETTER_SQLITE3 = "better-sqlite3",
	SQLCIPHER = "sqlcipher",
}

/**
 * The currently supported database drivers.
 */
export enum DatabaseDrivers {
	SQLITE = SqliteDatabaseDrivers.SQLITE,
	BETTER_SQLITE3 = SqliteDatabaseDrivers.BETTER_SQLITE3,
	SQLCIPHER = SqliteDatabaseDrivers.SQLCIPHER,
	POSTGRES = "postgres",
}

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
