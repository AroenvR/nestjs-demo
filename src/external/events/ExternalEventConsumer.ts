import { randomUUID } from "crypto";
import { createEventSource, EventSourceMessage } from "eventsource-client";
import { Injectable } from "@nestjs/common";
import { ILogger, IPrefixedLogger } from "../../common/utility/logging/ILogger";
import { IExternalEventConsumer, TProcessSSECallback } from "./IExternalEventConsumer";

/**
 * ExternalEventConsumer is a service that subscribes to an external event source
 * using Server-Sent Events (SSE) to publish events.
 * It handles connection management, message processing, and error handling.
 * This class implements the {@link IExternalEventConsumer} interface.
 */
@Injectable()
export class ExternalEventConsumer implements IExternalEventConsumer {
	private sseClient: ReturnType<typeof createEventSource> | null = null;
	private processEventCallback: (data: unknown) => Promise<void> | null = null;
	private eventsUrl: URL | null = null;
	protected readonly name: string;
	protected logger: ILogger;
	protected eventTypes: string[] = ["message"]; // TODO: Add support for different event types.
	public cleanUrl: string | undefined = undefined;

	constructor(protected readonly logAdapter: IPrefixedLogger) {
		this.name = this.constructor.name;
		this.logger = this.logAdapter.getPrefixedLogger(this.name);
	}

	/**
	 *
	 */
	public async connect(eventsUrl: URL, callback: TProcessSSECallback, headers?: Record<string, string>): Promise<void> {
		// Constructing this 'clean' url for logging purposes.
		this.cleanUrl = eventsUrl.hostname + eventsUrl.pathname; // TODO: Edge case test.
		if (!this.cleanUrl) throw new Error(`${this.name}: URL to connect to ${eventsUrl} may be faulty.`);

		this.logger.log(`Initializing event consuming for ${this.cleanUrl}`);

		this.eventsUrl = eventsUrl;
		this.processEventCallback = callback;

		if (!this.eventsUrl || !this.processEventCallback) {
			throw new Error(`${this.name}: Failed to set up the required data to connect to ${eventsUrl}`);
		}

		try {
			await this.connectToEventSource(headers);
		} catch (error) {
			this.logger.critical(`Failed to log in to external service at ${this.cleanUrl}. Event source connection will not be established.`, error);

			this.disconnect();
			throw error;
		}
	}

	/**
	 * Core method to orchestrate establishing and managing the SSE connection.
	 * It ensures cleanup of previous clients, initializes a new client,
	 * processes the event stream, and handles outcomes like unexpected stream termination or errors.
	 * @param url The URL of the SSE endpoint.
	 */
	public async connectToEventSource(headers?: Record<string, string>): Promise<void> {
		this.logger.info(`Attempting to connect to external event source: ${this.cleanUrl}`);

		try {
			this.sseClient = createEventSource({
				url: this.eventsUrl,
				headers: headers ?? this.getDefaultHeaders(),
				fetch: fetch,
			});

			// fire-and-forget, on next tick
			setImmediate(() => {
				this.processMessageStream().catch((err) => {
					this.logger.critical(`Error in message stream for ${this.cleanUrl}: ${err.message}`);
					this.disconnect();
				});
			});
		} catch (error) {
			throw new Error(`${this.name}: Error caught during stream setup / processing for ${this.cleanUrl}: ${error.message}`);
		}
	}

	/**
	 * Consumes events from the active SSE client using an async iterator.
	 * Handles individual message processing and first message received logic.
	 * This method will complete when the stream ends or is broken by an error or manual disconnect.
	 * @throws Will re-throw errors encountered during stream iteration to be handled by the caller.
	 */
	public async processMessageStream(): Promise<void> {
		this.logger.info(`Starting message stream processing for ${this.cleanUrl}`);

		if (!this.sseClient) {
			throw new Error(`${this.name}: SSE client not initialized for ${this.cleanUrl} message stream processing.`);
		}

		for await (const message of this.sseClient) {
			this.logger.correlationManager.runWithCorrelationId(randomUUID(), () => {
				this.handleMessage(message);
			});
		}
	}

	/**
	 * Handles incoming messages from the event source. It filters events based on `this.eventTypes`,
	 * validates that the message data is a non-empty string, parses the JSON data,
	 * and then delegates the parsed data to the injected service.
	 * @param msg The message object received from the external API.
	 */
	public handleMessage(msg: EventSourceMessage): void {
		const eventType = msg.event || "message";
		const eventId = msg.id || "N/A";

		if (!this.eventTypes.includes(eventType)) {
			this.logger.warn(`Received an unimplemented event of type ${eventType} with ID ${eventId} from ${this.cleanUrl}. Skipping.`);
			return;
		}

		if (typeof msg.data !== "string" || msg.data.trim() === "") {
			this.logger.error(
				`Received an invalid event of type ${eventType} with ID ${eventId} from ${this.cleanUrl}. Empty or non-string data. Skipping.`,
			);
			return;
		}

		try {
			this.logger.debug(`Received an event of type ${eventType} with ID ${eventId} from ${this.cleanUrl}`);

			const parsedData = JSON.parse(msg.data);
			this.processEventCallback(parsedData);
		} catch (error) {
			this.logger.error(`Error parsing JSON for event of type ${eventType} with ID ${eventId} from ${this.cleanUrl}: ${error.message}.`, error);
			this.logger.verbose(`Raw data for failed JSON parse from ${this.cleanUrl}:`, msg.data);
		}
	}

	/**
	 * Constructs the minimum default headers for an unauthenticated SSE request.
	 * @returns The request headers.
	 */
	public getDefaultHeaders(): Record<string, string> {
		const headers: Record<string, string> = {
			Accept: "text/event-stream",
			"Cache-Control": "no-cache",
		};

		return headers;
	}

	/**
	 * Manually disconnect from the event source.
	 */
	public disconnect(): void {
		this.logger.info(`Disconnecting from event source ${this.cleanUrl} & closing SSE client.`);

		if (!this.sseClient) {
			this.logger.warn(`No active SSE client to disconnect for ${this.cleanUrl}`);
			return;
		}

		this.sseClient.close();
		this.sseClient = null;

		this.eventsUrl = null;
		this.cleanUrl = undefined;
		this.processEventCallback = null;
	}
}
