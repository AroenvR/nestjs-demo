import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			useFactory: () => ({
				type: 'sqlite', // get driver from config file
				database: ':memory:', // get connection string from config file
				autoLoadEntities: true,
				synchronize: true, // get from config file => DO NOT ENABLE THIS IN PRODUCTION !!!
			}),
		}),
	],
})
export class DatabaseModule {} // TODO: Add support for Postgres & MariaDB
