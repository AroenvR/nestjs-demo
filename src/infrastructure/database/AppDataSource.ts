import { DataSource, DataSourceOptions } from "typeorm";
import { globSync } from 'glob';
import { join } from 'path';
import { ConfigService } from "@nestjs/config";
import { IServerConfig } from "../configuration/IServerConfig";

// Load entities dynamically from the dist folder
const entities = globSync('dist/**/*.entity.js').map((file) => require(join(process.cwd(), file)));

export const createDataSourceOptions = (configService: ConfigService<IServerConfig>): DataSourceOptions => {
    const databaseConfig = configService.get<IServerConfig['database']>('database');

    return {
        type: databaseConfig.driver,
        database: databaseConfig.database,
        host: databaseConfig.driver !== 'sqlite' ? databaseConfig.host : undefined,
        port: databaseConfig.driver !== 'sqlite' ? databaseConfig.port : undefined,
        username: databaseConfig.driver !== 'sqlite' ? databaseConfig.username : undefined,
        password: databaseConfig.driver !== 'sqlite' ? databaseConfig.password : undefined,
        synchronize: databaseConfig.synchronize,
        migrations: ['dist/migrations/*.js'],
        entities,
    };
};

export const AppDataSource = new DataSource(createDataSourceOptions(new ConfigService())); c