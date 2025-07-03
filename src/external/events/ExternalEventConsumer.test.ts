import { EventSourceMessage } from "eventsource-client";
import { ILogger } from "../../infrastructure/logging/ILogger";
import { ExternalEventConsumer } from "./ExternalEventConsumer";
import { WinstonAdapter } from "../../infrastructure/logging/adapters/WinstonAdapter";

/**
 * Mock implementation of AbstractExternalEventConsumer for testing purposes.
 */
class MockConsumer extends ExternalEventConsumer {
	constructor(logAdapter: WinstonAdapter) {
		super(logAdapter);
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
	let consumer: ExternalEventConsumer;
	let logger: ILogger;

	const url = new URL("/yolo", "http://www.somewhere.com");
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

		consumer = new MockConsumer(logAdapter);
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
			const callback = async (_: unknown) => {};

			consumer.setup(url, callback);

			expect(consumer["eventsUrl"]).toEqual(url);
			expect(consumer["processEventCallback"]).toEqual(callback);
			expect(logger.info).toHaveBeenCalledWith(`Setting up.`);
		});

		// --------------------------------------------------

		it("Can be initialized", async () => {
			const connectToEventSourceSpy = jest.spyOn(consumer, "connectToEventSource");
			const processMessageStreamSpy = jest.spyOn(consumer, "processMessageStream");

			const callback = async (_: unknown) => {};
			consumer.setup(url, callback);

			await consumer.connect();

			expect(consumer["sseClient"]).toBeDefined();
			expect(connectToEventSourceSpy).toHaveBeenCalledWith(url);
			expect(processMessageStreamSpy).toHaveBeenCalledTimes(1);

			expect(logger.info).toHaveBeenCalledWith(`Initializing event consuming.`);
		});

		// --------------------------------------------------

		it("Can connect to event source", async () => {
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
			const handleMessageSpy = jest.spyOn(consumer, "handleMessage");

			mockAsyncIteratorNextFunction
				.mockResolvedValueOnce({ done: false, value: messageEvent })
				.mockResolvedValueOnce({ done: true, value: undefined });

			await consumer.connectToEventSource(url);

			expect(handleMessageSpy).toHaveBeenCalledWith(messageEvent);
			expect(logger.correlationManager.runWithCorrelationId).toHaveBeenCalled();

			expect(logger.info).toHaveBeenCalledWith(`Starting message stream processing.`);
			expect(logger.debug).toHaveBeenCalledWith(`Received an event of type ${messageEvent.event} with ID ${messageEvent.id}.`);
		});

		// --------------------------------------------------

		it("Can disconnect from event source", async () => {
			await consumer.connectToEventSource(url);

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
		it("Should log critical and call disconnect if createEventSource throws", async () => {
			const errorMessage = "stream error";
			const disconnectSpy = jest.spyOn(consumer, "disconnect");

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
				const fakeCallback = jest.fn();
				consumer.setup(url, fakeCallback);
				handleEventSpy = jest.spyOn(consumer as any, "processEventCallback");
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
