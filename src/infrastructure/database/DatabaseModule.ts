import sqlite from "@journeyapps/sqlcipher";
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IServerConfig } from '../configuration/IServerConfig';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { SqliteDriverTwo } from "./SqliteDriver";

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService<IServerConfig>) => {
                const databaseConfig = configService.get<IServerConfig['database']>('database');

                return {
                    type: "sqlite", // databaseConfig.driver,
                    database: databaseConfig.database,
                    // database: "encrypted.db",
                    // driver: SqliteDriverTwo,
                    host: databaseConfig.driver !== 'sqlite' ? databaseConfig.host : undefined,
                    port: databaseConfig.driver !== 'sqlite' ? databaseConfig.port : undefined,
                    username: databaseConfig.driver !== 'sqlite' ? databaseConfig.username : undefined,
                    password: databaseConfig.driver !== 'sqlite' ? databaseConfig.password : undefined,
                    synchronize: databaseConfig.synchronize,
                    autoLoadEntities: true,
                    logging: true,
                    key: "yourencryptionkey",
                    extra: {
                        key: "yourencryptionkey",
                    },
                    options: {
                        key: "yourencryptionkey"
                    },
                    // prepareDatabase: (db) => {
                    // db.run("PRAGMA key = 'yourencryptionkey'");
                    // db.query("PRAGMA key = 'yourencryptionkey'");
                    // db.exec("PRAGMA key = 'yourencryptionkey'");
                    //     // console.log("DB:", db);
                    // }
                };
            },
            // dataSourceFactory: async (options) => {
            //     const datasource = new DataSource(options);

            //     await datasource.initialize();
            //     await datasource.query("PRAGMA foreign_keys = ON;");
            //     await datasource.query("PRAGMA key = 'yourencryptionkey';");

            //     return datasource;
            // }
        }),
    ],
})
export class DatabaseModule { }

// TODO: Add support for Postgres & MariaDB
// TODO: Add redis caching with "cache" { type: 'redis' }