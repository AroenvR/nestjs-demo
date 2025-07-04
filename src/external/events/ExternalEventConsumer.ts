import { randomUUID } from "crypto";
import { createEventSource, EventSourceMessage } from "eventsource-client";
import { OnModuleDestroy, Injectable } from "@nestjs/common";
import { ILogger } from "../../infrastructure/logging/ILogger";
import { WinstonAdapter } from "../../infrastructure/logging/adapters/WinstonAdapter";
import { IExternalEventConsumer } from "./IExternalEventConsumer";

/**
 * DOC
 */
@Injectable()
export class ExternalEventConsumer implements IExternalEventConsumer, OnModuleDestroy {
	private sseClient: ReturnType<typeof createEventSource> | null = null;
	private accessToken: string | null = null;
	private processEventCallback: (data: unknown) => Promise<void> | null = null;
	private eventsUrl: URL | null = null;
	protected readonly name: string;
	protected logger: ILogger;
	protected eventTypes: string[] = ["message"];

	constructor(protected readonly logAdapter: WinstonAdapter) {
		this.name = this.constructor.name;
		this.logger = this.logAdapter.getPrefixedLogger(this.name);
	}

	/**
	 *
	 */
	public setup(eventsUrl: URL, callback: (data: unknown) => Promise<void>) {
		this.logger.info(`Setting up.`);

		this.eventsUrl = eventsUrl;
		this.processEventCallback = callback;
	}

	/**
	 *
	 */
	public async connect(): Promise<void> {
		this.logger.info(`Initializing event consuming.`);

		if (!this.eventsUrl || !this.processEventCallback) {
			throw new Error(`${this.name}: Call setup first.`);
		}

		try {
			await this.connectToEventSource(this.eventsUrl);
		} catch (error) {
			this.logger.critical(`Failed to log in to external service. Event source connection will not be established.`, error);
		}
	}

	/**
	 * Lifecycle hook called when the module is being destroyed.
	 * Disconnects from the event source.
	 */
	public onModuleDestroy(): void {
		this.logger.log(`Destroying event consuming.`);
		this.disconnect();
	}

	/**
	 * Core method to orchestrate establishing and managing the SSE connection.
	 * It ensures cleanup of previous clients, initializes a new client,
	 * processes the event stream, and handles outcomes like unexpected stream termination or errors.
	 * @param url The URL of the SSE endpoint.
	 */
	public async connectToEventSource(url: URL): Promise<void> {
		this.logger.info(`Attempting to connect to external event source: ${url}`);

		try {
			this.sseClient = createEventSource({
				url,
				headers: this.getHeaders(),
				fetch: fetch,
			});

			this.processMessageStream();
		} catch (error) {
			this.logger.critical(`Error caught during stream setup / processing: ${error.message}`);
			this.disconnect();
		}
	}

	/**
	 * Consumes events from the active SSE client using an async iterator.
	 * Handles individual message processing and first message received logic.
	 * This method will complete when the stream ends or is broken by an error or manual disconnect.
	 * @throws Will re-throw errors encountered during stream iteration to be handled by the caller.
	 */
	public async processMessageStream(): Promise<void> {
		this.logger.info(`Starting message stream processing.`);

		if (!this.sseClient) {
			throw new Error(`${this.name}: SSE client not initialized for message stream processing.`);
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
			this.logger.warn(`Received an unimplemented event of type ${eventType} with ID ${eventId}. Skipping.`);
			return;
		}

		if (typeof msg.data !== "string" || msg.data.trim() === "") {
			this.logger.error(`Received an invalid event of type ${eventType} with ID ${eventId}. Empty or non-string data. Skipping.`);
			return;
		}

		try {
			this.logger.debug(`Received an event of type ${eventType} with ID ${eventId}.`);

			const parsedData = JSON.parse(msg.data);
			this.processEventCallback(parsedData);
		} catch (error) {
			this.logger.error(`Error parsing JSON for event of of type ${eventType} with ID ${eventId}: ${error.message}.`, error);
			this.logger.verbose(`Raw data for failed JSON parse:`, msg.data);
		}
	}

	/**
	 * Constructs the headers for the SSE request.
	 * @returns The request headers.
	 */
	public getHeaders(): Record<string, string> {
		const headers: Record<string, string> = {
			Accept: "text/event-stream",
			"Cache-Control": "no-cache",
		};

		if (this.accessToken) {
			headers["Authorization"] = `Bearer ${this.accessToken}`;
		}

		return headers;
	}

	/**
	 * Manually disconnect from the event source.
	 */
	public disconnect(): void {
		this.logger.info(`Disconnecting from event source & closing SSE client.`);

		if (!this.sseClient) {
			this.logger.warn(`No active SSE client to disconnect.`);
			return;
		}

		this.sseClient.close();
		this.sseClient = null;

		this.eventsUrl = null;
		this.processEventCallback = null;
	}

	/**
	 *
	 * @param token
	 */
	public setAccessToken(token: string) {
		this.accessToken = token;
	}
}
