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
import { INestApplication, Inject, Module } from "@nestjs/common";
import { createMockAppModule } from "../../__tests__/mocks/module/createMockAppModule";

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
	let adapter: AbstractExternalApiAdapter;

	beforeAll(async () => {
		app = await createMockAppModule(ExampleExternalApiAdapterModule);
		adapter = app.get(ExampleExternalApiAdapter);
	});

	it("Should be defined", () => {
		expect(adapter).toBeDefined();
	});
});
