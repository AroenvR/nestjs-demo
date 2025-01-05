/**
 * The currently supported database configurations.
 */
export type TDatabaseConfig =
    | {
        driver: 'sqlite';
        database: string;
        runMigrations: boolean;
        synchronize: boolean;
    }
    | {
        driver: 'postgres';
        database: string;
        host: string;
        port: number;
        username: string;
        password: string;
        runMigrations: boolean;
        synchronize: boolean;
    };
