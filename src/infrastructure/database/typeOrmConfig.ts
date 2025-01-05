import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { IServerConfig } from '../configuration/IServerConfig';

/**
 * Loads a TypeORM configuration based on the server configuration object.
 * @param configService Configuration service
 * @returns TypeORM configuration
 */
export const typeOrmConfig = (configService: ConfigService<IServerConfig>): TypeOrmModuleOptions => {
    const databaseConfig = configService.get<IServerConfig['database']>('database');

    return {
        type: databaseConfig.driver,
        database: databaseConfig.database,
        host: databaseConfig.driver !== 'sqlite' ? databaseConfig.host : undefined,
        port: databaseConfig.driver !== 'sqlite' ? databaseConfig.port : undefined,
        username: databaseConfig.driver !== 'sqlite' ? databaseConfig.username : undefined,
        password: databaseConfig.driver !== 'sqlite' ? databaseConfig.password : undefined,
        synchronize: databaseConfig.synchronize,
        autoLoadEntities: true, // Automatically load entities registered via TypeOrmModule.forFeature
        entities: [join(__dirname, '/../../domain/**/*Entity.ts')],
        migrations: [join(__dirname, './migrations/*.ts')],
        // cli: {
        // migrationsDir: 'src/migrations',
        //   },
        // logging: false,
    };
};
