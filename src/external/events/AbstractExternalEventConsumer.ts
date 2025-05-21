import { EventSource } from "eventsource";
import { OnModuleInit, OnModuleDestroy, NotImplementedException, Injectable } from "@nestjs/common";
import { ILogger, IPrefixedLogger } from "../../infrastructure/logging/ILogger";
import { AbstractExternalService } from "../services/AbstractExternalService";

/*
	TODO:
	- Add support for HTTP-Only JWT cookies / OIDC authentication 
	- Stop trying to reconnect after 5 attempts
*/

// EXAMPLE IMPLEMENTATION:
// export class TestConsumer extends AbstractExternalEventConsumer {
// 	constructor(
// 		@Inject(WinstonAdapter)
// 		protected readonly logAdapter: WinstonAdapter,
// 		protected readonly service: TestService,
// 	) {
// 		super(logAdapter, service);
// 	}

// 	/* Getters & Setters */

// 	protected get apiUrl(): string {
// 		return "http://localhost:3001/v1/user/events";
// 	}
// }

/**
 * AbstractExternalEventConsumer is an abstract class that provides a template for consuming events from an external API.
 * It handles the connection to the external event source, message parsing, and error handling.
 * This class is meant to be extended by other event consumer classes.
 * It uses the EventSource API to establish a connection to the external event source and listen for incoming events.
 * The class also implements the OnModuleInit and OnModuleDestroy interfaces to manage the lifecycle of the connection.
 */
@Injectable()
export class AbstractExternalEventConsumer implements OnModuleInit, OnModuleDestroy {
	protected readonly name: string;
	protected logger: ILogger;
	protected eventSource: EventSource | null = null;
	protected eventTypes: string[] = ["message"];

	constructor(
		protected readonly logAdapter: IPrefixedLogger,
		protected readonly service: AbstractExternalService,
	) {
		this.name = this.constructor.name;
		this.logger = this.logAdapter.getPrefixedLogger(this.name);
	}

	/**
	 * Gets executed as soon as the module is initialized.
	 */
	onModuleInit() {
		this.connectToEventSource(this.apiUrl);
	}

	/**
	 * Gets executed as soon as the module is destroyed.
	 */
	onModuleDestroy() {
		this.disconnect();
	}

	/**
	 * Connects to the external event source using the provided URL.
	 * @param url The URL of the external event source.
	 */
	protected connectToEventSource(url: string) {
		this.logger.info(`Connecting to external event source: ${url}`);

		try {
			this.eventSource = new EventSource(url);

			// Setup open event listener
			this.eventSource.addEventListener("open", () => {
				this.logger.info("Connection to external event source established");
			});

			// Setup event listeners for all event types
			this.eventTypes.forEach((eventType) => {
				this.eventSource.addEventListener(eventType, (event) => {
					try {
						const data = JSON.parse(event.data);
						this.logger.verbose(`Received '${eventType}' event from external API: ${JSON.stringify(data)}`);

						this.service.handleEvent(data);
					} catch (error) {
						this.logger.error(`Error processing external '${eventType}' event: ${error.message}`, error);
					}
				});
			});

			// Setup error event listener
			this.eventSource.addEventListener("error", (error) => {
				this.logger.error("Error with external event source connection", error);
				this.reconnect();
			});
		} catch (error) {
			this.logger.error(`Failed to connect to external event source: ${error.message}`, error);
			this.reconnect();
		}
	}

	/**
	 * Reconnect to the external event source after a delay
	 * @devnote This method is called when the connection to the external event source fails.
	 */
	private reconnect() {
		this.disconnect();

		// Attempt to reconnect after 2.5 seconds
		setTimeout(() => {
			this.logger.info("Attempting to reconnect to external event source...");
			this.connectToEventSource(this.apiUrl);
		}, 2500);
	}

	/**
	 * Disconnect from the external event source.
	 */
	private disconnect() {
		if (this.eventSource) {
			this.logger.info("Disconnecting from external event source");
			this.eventSource.close();
			this.eventSource = null;
		}
	}

	/* Getters & Setters */

	protected get apiUrl(): string {
		throw new NotImplementedException(`${this.constructor.name}: Abstract getter method not implemented`);
	}
}
