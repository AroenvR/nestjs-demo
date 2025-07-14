import { EventSourceMessage } from "eventsource-client";
import { ILogger } from "../../infrastructure/logging/ILogger";
import { ExternalEventConsumer } from "./ExternalEventConsumer";
import { WinstonAdapter } from "../../infrastructure/logging/adapters/WinstonAdapter";
import { MockExternalEventConsumer } from "../../__tests__/mocks/external/MockExternalEventConsumer";
import { TProcessSSECallback } from "./IExternalEventConsumer";

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
	const cleanUrl = url.hostname + url.pathname;
	const callback: TProcessSSECallback = async (_: unknown) => {};

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

		consumer = new MockExternalEventConsumer(logAdapter);
		logger = logAdapter.getPrefixedLogger(consumer.constructor.name);

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
		it("Can be initialized and connect to an external SSE stream", async () => {
			const connectToEventSourceSpy = jest.spyOn(consumer, "connectToEventSource");
			const processMessageStreamSpy = jest.spyOn(consumer, "processMessageStream");

			await consumer.connect(url, callback);
			await new Promise<void>((resolve) => setImmediate(resolve));

			expect(consumer["sseClient"]).toBeDefined();
			expect(connectToEventSourceSpy).toHaveBeenCalledTimes(1);
			expect(processMessageStreamSpy).toHaveBeenCalledTimes(1);

			expect(logger.log).toHaveBeenCalledWith(`Initializing event consuming for ${cleanUrl}`);
			expect(logger.info).toHaveBeenCalledWith(`Attempting to connect to external event source: ${cleanUrl}`);
			expect(logger.info).toHaveBeenCalledWith(`Starting message stream processing for ${cleanUrl}`);
		});

		// --------------------------------------------------

		it("Can connect with custom headers", async () => {
			const connectToEventSourceSpy = jest.spyOn(consumer, "connectToEventSource");
			const processMessageStreamSpy = jest.spyOn(consumer, "processMessageStream");

			const headers: Record<string, string> = {
				Accept: "text/event-stream",
				"Cache-Control": "no-cache",
				Authorization: `Bearer access_token`,
			};
			await consumer.connect(url, callback, headers);
			await new Promise<void>((resolve) => setImmediate(resolve));

			expect(consumer["sseClient"]).toBeDefined();
			expect(connectToEventSourceSpy).toHaveBeenCalledWith(headers);
			expect(processMessageStreamSpy).toHaveBeenCalledTimes(1);

			expect(logger.log).toHaveBeenCalledWith(`Initializing event consuming for ${cleanUrl}`);
			expect(logger.info).toHaveBeenCalledWith(`Attempting to connect to external event source: ${cleanUrl}`);
			expect(logger.info).toHaveBeenCalledWith(`Starting message stream processing for ${cleanUrl}`);
		});

		// --------------------------------------------------

		it("Can connect to event source", async () => {
			await consumer.connect(url, callback);
			await new Promise<void>((resolve) => setImmediate(resolve));

			expect(mockCreateEventSourceImplementation).toHaveBeenCalledWith({
				url,
				headers: consumer.getDefaultHeaders(),
				fetch: expect.any(Function),
			});
			expect(lastCreatedMockSseClient).toBeDefined();
		});

		// --------------------------------------------------

		it("Should delegate incoming messages to handleMessage", async () => {
			const handleMessageSpy = jest.spyOn(consumer, "handleMessage");

			mockAsyncIteratorNextFunction
				.mockResolvedValueOnce({ done: false, value: messageEvent })
				.mockResolvedValueOnce({ done: true, value: undefined });

			await consumer.connect(url, callback);
			await new Promise<void>((resolve) => setImmediate(resolve));

			expect(handleMessageSpy).toHaveBeenCalledWith(messageEvent);
			expect(logger.correlationManager.runWithCorrelationId).toHaveBeenCalled();

			expect(logger.info).toHaveBeenCalledWith(`Starting message stream processing for ${cleanUrl}`);
			expect(logger.debug).toHaveBeenCalledWith(`Received an event of type ${messageEvent.event} with ID ${messageEvent.id} from ${cleanUrl}`);
		});

		// --------------------------------------------------

		it("Can disconnect from event source", async () => {
			await consumer.connect(url, callback);
			await new Promise<void>((resolve) => setImmediate(resolve));

			consumer.disconnect();

			expect(mockSseClientCloseFunction).toHaveBeenCalled();
			expect((consumer as any).sseClient).toBeNull();

			expect(logger.info).toHaveBeenCalledWith(`Disconnecting from event source ${cleanUrl} & closing SSE client.`);
		});
	});

	// --------------------------------------------------

	describe("Error flow", () => {
		it("Should log critical and call disconnect if connecting fails", async () => {
			const errorMessage = "stream error";
			const disconnectSpy = jest.spyOn(consumer, "disconnect");

			// Stub createEventSource to throw on its setup connection call:
			mockCreateEventSourceImplementation.mockImplementationOnce(() => {
				throw new Error(errorMessage);
			});

			await expect(consumer.connect(url, callback)).rejects.toThrow(
				`Error caught during stream setup / processing for ${cleanUrl}: ${errorMessage}`,
			);
			await new Promise<void>((resolve) => setImmediate(resolve));

			expect(disconnectSpy).toHaveBeenCalled();

			expect(logger.info).toHaveBeenCalledWith(`Attempting to connect to external event source: ${cleanUrl}`);
			expect(logger.critical).toHaveBeenCalledWith(
				`Failed to log in to external service at ${cleanUrl}. Event source connection will not be established.`,
				expect.any(Error),
			);
		});

		// --------------------------------------------------

		it("Should log critical and call disconnect if processMessageStream rejects", async () => {
			const errorMessage = "stream error";
			const disconnectSpy = jest.spyOn(consumer, "disconnect");

			jest.spyOn(consumer, "processMessageStream").mockRejectedValueOnce(new Error(errorMessage));

			await consumer.connect(url, callback);
			await new Promise<void>((resolve) => setImmediate(resolve));

			expect(disconnectSpy).toHaveBeenCalled();
			expect(logger.critical).toHaveBeenCalledWith(`Error in message stream for ${cleanUrl}: ${errorMessage}`);
		});

		// --------------------------------------------------

		it("Throws if processMessageStream is called without initializing sseClient", async () => {
			const handleMessageSpy = jest.spyOn(consumer, "handleMessage");
			expect((consumer as any).sseClient).toBeNull();

			await expect(consumer.processMessageStream()).rejects.toThrow(
				`${consumer.constructor.name}: SSE client not initialized for ${undefined} message stream processing.`,
			);

			expect(handleMessageSpy).not.toHaveBeenCalled();

			expect(logger.info).toHaveBeenCalledWith(`Starting message stream processing for ${undefined}`);
		});

		// --------------------------------------------------

		it("Logs and returns cleanly when there is no SSE client", () => {
			expect((consumer as any).sseClient).toBeNull();

			consumer.disconnect();

			expect(mockSseClientCloseFunction).not.toHaveBeenCalled();

			expect(logger.info).toHaveBeenCalledWith(`Disconnecting from event source ${undefined} & closing SSE client.`);
			expect(logger.warn).toHaveBeenCalledWith(`No active SSE client to disconnect for ${undefined}`);
		});

		// --------------------------------------------------

		describe("handleMessage error cases", () => {
			let handleEventSpy: jest.SpyInstance;

			beforeEach(() => {
				const fakeCallback = jest.fn();
				consumer.connect(url, fakeCallback);
				handleEventSpy = jest.spyOn(consumer as any, "processEventCallback");
			});

			afterEach(() => {
				consumer.disconnect();
			});

			// --------------------------------------------------

			it("Should skip messages whose event type isn't in eventTypes", () => {
				messageEvent.event = "unknown_event";
				messageEvent.data = JSON.stringify({});

				consumer.handleMessage(messageEvent);
				expect(handleEventSpy).not.toHaveBeenCalled();

				expect(logger.warn).toHaveBeenCalledWith(
					`Received an unimplemented event of type ${messageEvent.event} with ID ${messageEvent.id} from ${cleanUrl}. Skipping.`,
				);
			});

			// --------------------------------------------------

			it("Should skip messages whose data is not a string", () => {
				messageEvent.data = 123 as unknown as string;

				consumer.handleMessage(messageEvent);
				expect(handleEventSpy).not.toHaveBeenCalled();

				expect(logger.error).toHaveBeenCalledWith(
					`Received an invalid event of type ${messageEvent.event} with ID ${messageEvent.id} from ${cleanUrl}. Empty or non-string data. Skipping.`,
				);
			});

			// --------------------------------------------------

			it("Should skip messages whose data is an empty/whitespace string", () => {
				messageEvent.data = "   ";

				consumer.handleMessage(messageEvent);
				expect(handleEventSpy).not.toHaveBeenCalled();

				expect(logger.error).toHaveBeenCalledWith(
					`Received an invalid event of type ${messageEvent.event} with ID ${messageEvent.id} from ${cleanUrl}. Empty or non-string data. Skipping.`,
				);
			});

			// --------------------------------------------------

			it("Should log errors when JSON.parse throws", () => {
				messageEvent.data = "{ invalidJson: true,"; // malformed JSON

				consumer.handleMessage(messageEvent);
				expect(handleEventSpy).not.toHaveBeenCalled();

				expect(logger.debug).toHaveBeenCalledWith(
					`Received an event of type ${messageEvent.event} with ID ${messageEvent.id} from ${cleanUrl}`,
				);
				expect(logger.error).toHaveBeenCalledWith(
					expect.stringContaining(
						`Error parsing JSON for event of type ${messageEvent.event} with ID ${messageEvent.id} from ${cleanUrl}:`,
					),
					expect.any(SyntaxError),
				);
			});
		});
	});
});
