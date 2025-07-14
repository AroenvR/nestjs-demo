import { INestApplication, Inject, Module } from "@nestjs/common";
import { WinstonAdapter } from "../../infrastructure/logging/adapters/WinstonAdapter";
import { AbstractExternalApiAdapter } from "./AbstractExternalApiAdapter";
import { RequestBuilder } from "../../common/utility/request_builder/RequestBuilder";
import { ConfigService } from "@nestjs/config";
import { IServerConfig } from "../../infrastructure/configuration/IServerConfig";
import {
	EXTERNAL_EVENT_CONSUMER_FACTORY,
	ExternalEventConsumerFactoryProvider,
	IExternalEventConsumerFactory,
} from "../events/IExternalEventConsumerFactory";
import { createMockAppModule } from "../../__tests__/mocks/module/createMockAppModule";
import { mapFetchRequestResponse, mockAndSpyFetchRequest } from "../../__tests__/helpers/mockAndSpyFetchRequest";
import { MockCreateLoginDto } from "../../__tests__/mocks/dto/MockLoginDto";
import { IPrefixedLogger } from "../../infrastructure/logging/ILogger";

/* 
	This file serves as documentation for how to set up an External API Adapter.
	It provides an example implementation of the AbstractExternalApiAdapter class.
	The ExampleExternalApiAdapter class extends the AbstractExternalApiAdapter and implements the required methods.
	The ExampleExternalApiAdapterModule is a NestJS module that provides the ExampleExternalApiAdapter
	and registers the ExternalEventConsumerFactoryProvider.
	To use this adapter, import the ExampleExternalApiAdapterModule in your application module.
	The adapter can then be injected into your services or controllers as needed.
*/

/**
 * Example implementation of the AbstractExternalApiAdapter.
 */
class ExampleExternalApiAdapter extends AbstractExternalApiAdapter {
	constructor(
		logAdapter: WinstonAdapter,
		requestBuilder: RequestBuilder,
		configService: ConfigService<IServerConfig>,
		@Inject(EXTERNAL_EVENT_CONSUMER_FACTORY)
		factory: IExternalEventConsumerFactory,
	) {
		super(logAdapter, requestBuilder, configService, factory);
	}

	/**
	 *
	 */
	public externalConfigKey() {
		return "test_api";
	}
}

@Module({
	providers: [
		ExampleExternalApiAdapter, // Your own adapter
		ExternalEventConsumerFactoryProvider,
	],
	exports: [ExampleExternalApiAdapter],
})
class ExampleExternalApiAdapterModule {} // The module to import if you want to use the adapter

/*
	This works, and config is now an array so we can create multiple Adapters.
	The events variable has been made into an array, so that should be used for creating new event listeners.
*/

const TEST_NAME = "AbstractExternalApiAdapter.Integration";
describe(TEST_NAME, () => {
	process.env.TEST_NAME = TEST_NAME; // Creates a log file named with this test's name.

	let app: INestApplication;
	let configService: ConfigService<IServerConfig>;
	let adapter: AbstractExternalApiAdapter;
	let logger: IPrefixedLogger;

	let logSpy: jest.SpyInstance;

	beforeAll(async () => {
		app = await createMockAppModule(ExampleExternalApiAdapterModule);
		configService = app.get(ConfigService);
		adapter = app.get(ExampleExternalApiAdapter);
		logger = app.get(WinstonAdapter);
	});

	beforeEach(() => {
		logSpy = jest.spyOn(logger, "log");
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	afterAll(async () => {
		await app.close();
	});

	// --------------------------------------------------

	it("Should be defined", () => {
		expect(adapter).toBeDefined();
	});

	// --------------------------------------------------

	it("Can log in to an external API", async () => {
		const mockToken = "access_token";

		mockAndSpyFetchRequest(mockToken);
		const setAccessTokenSpy = jest.spyOn(adapter, "setAccessToken");

		await adapter.login("/v1/auth/login", MockCreateLoginDto.get());

		expect(setAccessTokenSpy).toHaveBeenCalledWith(mockToken);

		const externalConfig = configService.get<IServerConfig["external"]>("external");
		const adapterConfig = externalConfig.find((config) => config.key === adapter.externalConfigKey());

		expect(logSpy).toHaveBeenCalledWith(adapter.name, `Logging in to ${adapterConfig.domain}`, undefined);
	});

	// --------------------------------------------------

	it("Can subscribe to a SSE streams", async () => {
		const newTokenResponse = mapFetchRequestResponse("updated_access_token");
		const successResponse = mapFetchRequestResponse({ ok: true });

		jest.spyOn(global, "fetch").mockResolvedValueOnce(newTokenResponse).mockResolvedValueOnce(successResponse);

		await adapter.login("/v1/auth/login", MockCreateLoginDto.get());

		const mockCallback = jest.fn().mockResolvedValue(undefined);
		const mockEndpoint = "/v1/mock/events";

		await adapter.subscribeToSSE(mockEndpoint, mockCallback);
		expect(adapter.consumers.get(mockEndpoint)).toBeDefined();
	});
});
