import { ConfigService } from "@nestjs/config";
import { createMockAppModule } from "../../__tests__/mocks/module/createMockAppModule";
import { UtilityModule } from "./UtilityModule";
import { EncryptionUtils } from "./aes/EncryptionUtils";
import { CacheManagerAdapter } from "./cache/CacheManagerAdapter";
import { IRequestBuilder, RequestBuilder } from "./request_builder/RequestBuilder";
import { IPrefixedLogger } from "./logging/ILogger";
import { CronJobFactory } from "./Cron/CronJobFactory";
import { WinstonAdapter } from "./logging/adapters/WinstonAdapter";
import { INestApplication } from "@nestjs/common";

describe("UtilityModule", () => {
	let app: INestApplication;

	let configService: ConfigService;
	let logAdapter: IPrefixedLogger;
	let encryptionUtils: EncryptionUtils;
	let requestBuilder: IRequestBuilder;
	let cache: CacheManagerAdapter;
	let cronFactory: CronJobFactory;

	beforeEach(async () => {
		app = await createMockAppModule(UtilityModule);

		configService = app.get<ConfigService>(ConfigService);
		logAdapter = app.get<WinstonAdapter>(WinstonAdapter);
		encryptionUtils = app.get<EncryptionUtils>(EncryptionUtils);
		requestBuilder = app.get<IRequestBuilder>(RequestBuilder);
		cache = app.get<CacheManagerAdapter>(CacheManagerAdapter);
		cronFactory = app.get<CronJobFactory>(CronJobFactory);
	});

	afterEach(async () => {
		await app.close();
	});

	// --------------------------------------------------

	it("Utilities should be defined", () => {
		expect(configService).toBeDefined();
		expect(logAdapter).toBeDefined();
		expect(encryptionUtils).toBeDefined();
		expect(requestBuilder).toBeDefined();
		expect(cache).toBeDefined();
		expect(cronFactory).toBeDefined();
	});
});
