import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { IServerConfig } from "../configuration/IServerConfig";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmOptionsFactory } from "./TypeOrmOptionsFactory";

@Module({
	imports: [
		ConfigModule,
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService<IServerConfig>) => {
				const databaseConfig = configService.get<IServerConfig["database"]>("database");
				const logConfig = configService.get<IServerConfig["logging"]>("logging");

				let enableDbLogging = false;
				if (logConfig.level === "verbose" && logConfig.console === true) {
					enableDbLogging = logConfig.database;
				}

				const factory = new TypeOrmOptionsFactory();
				return factory.createTypeOrmModuleOptions(databaseConfig, enableDbLogging);
			},
		}),
	],
})
export class DatabaseModule {}
