import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configurator, TLoadOpts } from '../configurator/Configurator';
import { TDatabaseConfig } from './TDatabaseConfig';
import { defaultServerConfig } from '../IServerConfig';
import { databaseJSONSchema } from './DatabaseJsonSchema';

const fallbackDbConfig: TLoadOpts<TDatabaseConfig> = { loader: 'object', config: defaultServerConfig.database };
const databaseConfig = new Configurator(databaseJSONSchema, 'DATABASE_CONFIG', fallbackDbConfig).loadConfiguration();

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			useFactory: () => ({
				type: databaseConfig.driver,
				database: databaseConfig.database,
				host: databaseConfig.driver !== 'sqlite' ? databaseConfig.host : undefined,
				port: databaseConfig.driver !== 'sqlite' ? databaseConfig.port : undefined,
				username: databaseConfig.driver !== 'sqlite' ? databaseConfig.username : undefined,
				password: databaseConfig.driver !== 'sqlite' ? databaseConfig.password : undefined,
				synchronize: databaseConfig.synchronize,
				autoLoadEntities: true,
			}),
		}),
	],
})
export class DatabaseModule {} // TODO: Add support for Postgres & MariaDB
