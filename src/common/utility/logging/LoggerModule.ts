import { Global, Module } from "@nestjs/common";
import { IServerConfig } from "../../../infrastructure/configuration/IServerConfig";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CorrelationManager } from "./correlation/CorrelationManager";
import { WinstonAdapter } from "./adapters/WinstonAdapter";

@Global()
@Module({
	imports: [ConfigModule],
	providers: [
		{
			provide: WinstonAdapter,
			inject: [ConfigService],
			useFactory: (configService: ConfigService<IServerConfig>) => {
				const config = configService.get<IServerConfig["logging"]>("logging");
				if (!config || !config.driver) throw new Error(`LoggerModule: Logging configuration is invalid.`);

				const correlationManager = new CorrelationManager();

				if (config.file.enabled) {
					// iF the file name contains TIMESTAMPED, replace it with the current timestamp
					config.file.name = config.file.name === "TIMESTAMPED" ? `${config.appName}.${Date.now().toString()}.log` : config.file.name;

					// if the file name contains TEST_NAME, replace it with the environment value of process.env.TEST_NAME
					config.file.name = config.file.name === "TEST_NAME.test.log" ? `${process.env.TEST_NAME}.test.log` : config.file.name;
				}

				switch (config.driver) {
					case "winston":
						return new WinstonAdapter(config, correlationManager);
					default:
						throw new Error("Unsupported logging driver selected.");
				}
			},
		},
	],
	exports: [WinstonAdapter],
})
export class LoggerModule {}
