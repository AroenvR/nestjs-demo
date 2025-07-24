import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EncryptionUtils } from "./aes/EncryptionUtils";
import { RequestBuilder } from "./request_builder/RequestBuilder";
import { CacheManagerAdapter } from "./cache/CacheManagerAdapter";
import { WinstonAdapter } from "./logging/adapters/WinstonAdapter";
import { CorrelationManager } from "./logging/correlation/CorrelationManager";
import { IServerConfig } from "../../infrastructure/configuration/IServerConfig";
import { Utilities } from "./Utilities";

@Global()
@Module({
	providers: [
		EncryptionUtils,
		RequestBuilder,
		CacheManagerAdapter,
		{
			provide: WinstonAdapter,
			inject: [ConfigService],
			useFactory: (configService: ConfigService<IServerConfig>) => {
				const config = configService.get<IServerConfig["logging"]>("logging");
				if (!config || !config.driver) throw new Error(`LoggerModule: Logging configuration is invalid.`);

				const correlationManager = new CorrelationManager();

				if (config.file.enabled) {
					config.file.name = config.file.name === "TIMESTAMPED" ? `${config.appName}.${Date.now().toString()}.log` : config.file.name;

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
		Utilities,
	],
	exports: [EncryptionUtils, RequestBuilder, CacheManagerAdapter, WinstonAdapter, Utilities],
})
export class UtilityModule {}
