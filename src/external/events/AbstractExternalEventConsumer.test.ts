import { EventSourceMessage } from "eventsource-client";
import { ConfigService } from "@nestjs/config";
import { ILogger, IPrefixedLogger } from "../../infrastructure/logging/ILogger";
import { AbstractExternalService } from "../services/AbstractExternalService";
import { AbstractExternalEventConsumer } from "./AbstractExternalEventConsumer";
import { WinstonAdapter } from "../../infrastructure/logging/adapters/WinstonAdapter";
import { RequestBuilder } from "../../common/utility/request_builder/RequestBuilder";
import { IServerConfig } from "../../infrastructure/configuration/IServerConfig";

/**
 * Mock implementation of AbstractExternalService for testing purposes.
 */
class MockExternalService extends AbstractExternalService {
	constructor(
		protected readonly logAdapter: WinstonAdapter,
		protected readonly requestBuilder: RequestBuilder,
		protected readonly configService: ConfigService<IServerConfig>,
	) {
		super(logAdapter, requestBuilder, configService);
	}

	public getApiUrl(): string {
		return "http://api.example.com/v1/endpoint/events";
	}

	public async login(): Promise<string> {
		return "bearer-token";
	}

	public async handleEvent(data: unknown): Promise<void> {
		this.logger.verbose(`Processing user event:`, data);
	}

	/* Getters & Setters */

	public get config() {
		return {};
	}
}

/**
 * Mock implementation of AbstractExternalEventConsumer for testing purposes.
 */
class MockConsumer extends AbstractExternalEventConsumer {
	constructor(logAdapter: IPrefixedLogger, service: AbstractExternalService) {
		super(logAdapter, service);
	}
}

/* eslint-disable no-var */
// The no-var ESLint rule is disabled here to fix these variables being stuck in the TDZ.
var mockCreateEventSourceImplementation: jest.Mock;
var mockSseClientCloseFunction: jest.Mock;
var mockAsyncIteratorNextFunction: jest.Mock;
var lastCreatedMockSseClient: any;
/* eslint-enable no-var */

// Mock the 'eventsource-client' module
jest.mock("eventsource-client", () => {
	mockCreateEventSourceImplementation = jest.fn();
	mockSseClientCloseFunction = jest.fn();
	mockAsyncIteratorNextFunction = jest.fn();

	// The mockCreateEventSourceImplementation will be what's actually called by the consumer's code.
	mockCreateEventSourceImplementation.mockImplementation((_?: { url: string; headers?: Record<string, string>; fetch?: any }) => {
		// This is the mock SSE client instance that will be returned
		lastCreatedMockSseClient = {
			close: mockSseClientCloseFunction,
			[Symbol.asyncIterator]: jest.fn(() => {
				return {
					next: mockAsyncIteratorNextFunction,
				};
			}),
		};
		return lastCreatedMockSseClient;
	});

	return {
		createEventSource: mockCreateEventSourceImplementation,
	};
});

/* -------- ACTUAL TEST STARTS HERE -------- */

describe("AbstractExternalEventConsumer", () => {
	let service: AbstractExternalService;
	let consumer: AbstractExternalEventConsumer;
	let logger: ILogger;

	let messageEvent: EventSourceMessage;

	beforeEach(async () => {
		mockCreateEventSourceImplementation.mockClear();
		mockSseClientCloseFunction.mockClear();
		mockAsyncIteratorNextFunction.mockClear();

		const logAdapter = {
			getPrefixedLogger: jest.fn().mockReturnValue({
				correlationManager: {
					runWithCorrelationId: jest.fn((_, cb) => cb()),
				},
				debug: jest.fn(),
				verbose: jest.fn(),
				info: jest.fn(),
				log: jest.fn(),
				warn: jest.fn(),
				error: jest.fn(),
				critical: jest.fn(),
			}),
		} as unknown as WinstonAdapter;

		const requestBuilder = new RequestBuilder(logAdapter);
		const configService = {} as ConfigService<IServerConfig>;

		service = new MockExternalService(logAdapter, requestBuilder, configService);
		consumer = new MockConsumer(logAdapter, service);
		logger = logAdapter.getPrefixedLogger(MockConsumer.name);

		messageEvent = {
			id: "1",
			event: "message",
			data: JSON.stringify({ hello: "world" }),
		};
	});

	// --------------------------------------------------

	it("Should be defined", () => {
		expect(consumer).toBeDefined();
	});

	// --------------------------------------------------

	describe("Happy flow", () => {
		it("Can be initialized", async () => {
			const loginSpy = jest.spyOn(service, "login");
			const connectToEventSourceSpy = jest.spyOn(consumer, "connectToEventSource");
			const processMessageStreamSpy = jest.spyOn(consumer, "processMessageStream");

			await consumer.onModuleInit();

			expect(loginSpy).toHaveBeenCalledTimes(1);
			expect(connectToEventSourceSpy).toHaveBeenCalledWith(service.getApiUrl());
			expect(processMessageStreamSpy).toHaveBeenCalledTimes(1);

			expect(logger.log).toHaveBeenCalledWith(`Initializing event consuming.`);
		});

		// --------------------------------------------------

		it("Can connect to event source", async () => {
			const url = service.getApiUrl();
			await consumer.connectToEventSource(url);

			expect(mockCreateEventSourceImplementation).toHaveBeenCalledWith({
				url,
				headers: consumer.getHeaders(),
				fetch: expect.any(Function),
			});
			expect(lastCreatedMockSseClient).toBeDefined();

			expect(logger.info).toHaveBeenCalledWith(`Attempting to connect to external event source: ${url}`);
		});

		// --------------------------------------------------

		it("Should delegate incoming messages to handleMessage", async () => {
			const handleEventSpy = jest.spyOn(service, "handleEvent");
			const handleMessageSpy = jest.spyOn(consumer, "handleMessage");

			mockAsyncIteratorNextFunction
				.mockResolvedValueOnce({ done: false, value: messageEvent })
				.mockResolvedValueOnce({ done: true, value: undefined });

			await consumer.connectToEventSource(service.getApiUrl());

			expect(handleMessageSpy).toHaveBeenCalledWith(messageEvent);
			expect(handleEventSpy).toHaveBeenCalledWith(JSON.parse(messageEvent.data));
			expect(logger.correlationManager.runWithCorrelationId).toHaveBeenCalled();

			expect(logger.info).toHaveBeenCalledWith(`Starting message stream processing.`);
			expect(logger.debug).toHaveBeenCalledWith(`Received an event of type ${messageEvent.event} with ID ${messageEvent.id}.`);
		});

		// --------------------------------------------------

		it("Can disconnect from event source", async () => {
			await consumer.connectToEventSource(service.getApiUrl());

			consumer.disconnect();

			expect(mockSseClientCloseFunction).toHaveBeenCalled();
			expect((consumer as any).sseClient).toBeNull();

			expect(logger.info).toHaveBeenCalledWith(`Disconnecting from event source & closing SSE client.`);
		});

		// --------------------------------------------------

		it("Should log and call disconnect on module destroy", () => {
			const disconnectSpy = jest.spyOn(consumer, "disconnect");

			consumer.onModuleDestroy();
			expect(disconnectSpy).toHaveBeenCalled();

			expect(logger.log).toHaveBeenCalledWith(`Destroying event consuming.`);
		});
	});

	// --------------------------------------------------

	describe("Error flow", () => {
		it("Handles login failure gracefully", async () => {
			jest.spyOn(service, "login").mockRejectedValue(new Error("Login failed"));
			const connectToEventSourceSpy = jest.spyOn(consumer, "connectToEventSource");
			const processMessageStreamSpy = jest.spyOn(consumer, "processMessageStream");

			await consumer.onModuleInit();

			expect(connectToEventSourceSpy).not.toHaveBeenCalled();
			expect(processMessageStreamSpy).not.toHaveBeenCalled();

			expect(logger.critical).toHaveBeenCalledWith(
				`Failed to log in to external service. Event source connection will not be established.`,
				expect.any(Error),
			);
		});

		// --------------------------------------------------

		it("Should log critical and call disconnect if createEventSource throws", async () => {
			const errorMessage = "stream error";
			const disconnectSpy = jest.spyOn(consumer, "disconnect");
			const url = service.getApiUrl();

			// Stub createEventSource to throw on its first call:
			mockCreateEventSourceImplementation.mockImplementationOnce(() => {
				throw new Error(errorMessage);
			});

			await consumer.connectToEventSource(url);

			expect(disconnectSpy).toHaveBeenCalled();

			expect(logger.info).toHaveBeenCalledWith(`Attempting to connect to external event source: ${url}`);
			expect(logger.critical).toHaveBeenCalledWith(`Error caught during stream setup / processing: ${errorMessage}`);
		});

		// --------------------------------------------------

		it("Should log critical and call disconnect if processMessageStream rejects", async () => {
			const errorMessage = "stream error";
			const disconnectSpy = jest.spyOn(consumer, "disconnect");
			const url = service.getApiUrl();

			jest.spyOn(consumer, "processMessageStream").mockRejectedValueOnce(new Error(errorMessage));

			await consumer.connectToEventSource(url);
			expect(disconnectSpy).toHaveBeenCalled();

			expect(logger.critical).toHaveBeenCalledWith(`Error caught during stream setup / processing: ${errorMessage}`);
		});

		// --------------------------------------------------

		it("Throws if processMessageStream is called without initializing sseClient", async () => {
			const handleMessageSpy = jest.spyOn(consumer, "handleMessage");
			expect((consumer as any).sseClient).toBeNull();

			await expect(consumer.processMessageStream()).rejects.toThrow(
				`${consumer.constructor.name}: SSE client not initialized for message stream processing.`,
			);

			expect(handleMessageSpy).not.toHaveBeenCalled();

			expect(logger.info).toHaveBeenCalledWith(`Starting message stream processing.`);
		});

		// --------------------------------------------------

		it("Logs and returns cleanly when there is no SSE client", () => {
			expect((consumer as any).sseClient).toBeNull();

			consumer.disconnect();

			expect(mockSseClientCloseFunction).not.toHaveBeenCalled();

			expect(logger.info).toHaveBeenCalledWith(`Disconnecting from event source & closing SSE client.`);
			expect(logger.warn).toHaveBeenCalledWith(`No active SSE client to disconnect.`);
		});

		// --------------------------------------------------

		describe("handleMessage error cases", () => {
			let handleEventSpy: jest.SpyInstance;

			beforeEach(() => {
				handleEventSpy = jest.spyOn(service, "handleEvent");
			});

			// --------------------------------------------------

			it("Should skip messages whose event type isn't in eventTypes", () => {
				messageEvent.event = "unknown_event";
				messageEvent.data = JSON.stringify({});

				consumer.handleMessage(messageEvent);
				expect(handleEventSpy).not.toHaveBeenCalled();

				expect(logger.warn).toHaveBeenCalledWith(
					`Received an unimplemented event of type ${messageEvent.event} with ID ${messageEvent.id}. Skipping.`,
				);
			});

			// --------------------------------------------------

			it("Should skip messages whose data is not a string", () => {
				messageEvent.data = 123 as unknown as string;

				consumer.handleMessage(messageEvent);
				expect(handleEventSpy).not.toHaveBeenCalled();

				expect(logger.error).toHaveBeenCalledWith(
					`Received an invalid event of type ${messageEvent.event} with ID ${messageEvent.id}. Empty or non-string data. Skipping.`,
				);
			});

			// --------------------------------------------------

			it("Should skip messages whose data is an empty/whitespace string", () => {
				messageEvent.data = "   ";

				consumer.handleMessage(messageEvent);
				expect(handleEventSpy).not.toHaveBeenCalled();

				expect(logger.error).toHaveBeenCalledWith(
					`Received an invalid event of type ${messageEvent.event} with ID ${messageEvent.id}. Empty or non-string data. Skipping.`,
				);
			});

			// --------------------------------------------------

			it("Should log errors when JSON.parse throws", () => {
				messageEvent.data = "{ invalidJson: true,"; // malformed JSON

				consumer.handleMessage(messageEvent);
				expect(handleEventSpy).not.toHaveBeenCalled();

				expect(logger.debug).toHaveBeenCalledWith(`Received an event of type ${messageEvent.event} with ID ${messageEvent.id}.`);
				expect(logger.error).toHaveBeenCalledWith(
					expect.stringContaining(`Error parsing JSON for event of of type ${messageEvent.event} with ID ${messageEvent.id}:`),
					expect.any(SyntaxError),
				);
			});
		});
	});
});
