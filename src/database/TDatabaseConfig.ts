/**
 * The currently supported database configurations.
 */
export type TDatabaseConfig =
	| {
			driver: 'sqlite';
			database: string;
			synchronize: boolean;
	  }
	| {
			driver: 'postgres';
			database: string;
			host: string;
			port: number;
			username: string;
			password: string;
			synchronize: boolean;
	  };
