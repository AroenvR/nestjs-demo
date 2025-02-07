import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IServerConfig } from '../configuration/IServerConfig';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
	imports: [
		ConfigModule,
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService<IServerConfig>) => {
				const databaseConfig = configService.get<IServerConfig['database']>('database');
				const loggingConfig = configService.get<IServerConfig['logging']>('logging');

				return {
					type: databaseConfig.driver,
					database: databaseConfig.database,
					host: databaseConfig.driver !== 'sqlite' ? databaseConfig.host : undefined,
					port: databaseConfig.driver !== 'sqlite' ? databaseConfig.port : undefined,
					username: databaseConfig.driver !== 'sqlite' ? databaseConfig.username : undefined,
					password: databaseConfig.driver !== 'sqlite' ? databaseConfig.password : undefined,
					synchronize: databaseConfig.synchronize,
					autoLoadEntities: true,
					logging: loggingConfig.database,
				};
			},
		}),
	],
})
export class DatabaseModule {} // TODO: Add support for Postgres & MariaDBz
