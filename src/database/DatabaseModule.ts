import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IServerConfig } from '../server_config/IServerConfig';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
	imports: [
		ConfigModule, // Add this line to import ConfigModule
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule], // Ensure ConfigModule is available in the module scope
			inject: [ConfigService],
			useFactory: (configService: ConfigService<IServerConfig>) => {
				const databaseConfig = configService.get<IServerConfig['database']>('database');

				return {
					type: databaseConfig.driver,
					database: databaseConfig.database,
					host: databaseConfig.driver !== 'sqlite' ? databaseConfig.host : undefined,
					port: databaseConfig.driver !== 'sqlite' ? databaseConfig.port : undefined,
					username: databaseConfig.driver !== 'sqlite' ? databaseConfig.username : undefined,
					password: databaseConfig.driver !== 'sqlite' ? databaseConfig.password : undefined,
					synchronize: databaseConfig.synchronize,
					autoLoadEntities: true,
				};
			},
		}),
	],
})
export class DatabaseModule {} // TODO: Add support for Postgres & MariaDB
