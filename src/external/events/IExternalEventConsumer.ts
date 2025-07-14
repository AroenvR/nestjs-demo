/**
 * Type definition for a callback to register for the consumption of external API Server-Sent-Events (SSE).
 */
export type TProcessSSECallback = (data: unknown) => Promise<void>;

/**
 * IExternalEventConsumer is an interface that defines the contract for consuming SSE from an external event source.
 * It provides methods to connect to the event source and disconnect from the event source
 */
export interface IExternalEventConsumer {
	/**
	 * Establishes a connection to the external event source.
	 * It initializes the event source URL and the callback function to process incoming events.
	 * If the connection fails, it logs an error and does not establish the event source connection
	 * until the next call to this method.
	 * @param eventsUrl The URL of the event source to connect to.
	 * @param headers Optional headers to overwrite the defaults for the connection request.
	 * @param callback The callback function to process incoming events.
	 * @throws Will throw an error if the `eventsUrl` or `processEventCallback is not set before calling this method.
	 */
	connect(eventsUrl: URL, callback: TProcessSSECallback, headers?: Record<string, string>): Promise<void>;

	/**
	 * Manually disconnect from the event source.
	 */
	disconnect(): void;
}
