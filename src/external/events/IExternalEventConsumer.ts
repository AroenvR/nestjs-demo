/**
 * doc
 */
export interface IExternalEventConsumer {
	/**
	 * Registers a callback function to process incoming events.
	 * This callback will be invoked with the parsed data from the event source.
	 * @param callback A function that takes the parsed event data as an argument and returns
	 * a Promise<void>. This function will be called for each event received from the event source.
	 */
	registerCallback(callback: (data: unknown) => Promise<void>): void;

	/**
	 * Establishes a connection to the external event source.
	 * It initializes the event source URL and the callback function to process incoming events.
	 * If the connection fails, it logs an error and does not establish the event source connection
	 * until the next call to this method.
	 * @param eventsUrl The URL of the event source to connect to.
	 * @param headers Optional headers to overwrite the defaults for the connection request.
	 * @throws Will throw an error if the `eventsUrl` or `processEventCallback is not set before calling this method.
	 */
	connect(eventsUrl: URL, headers?: Record<string, string>): Promise<void>;

	/**
	 * Manually disconnect from the event source.
	 */
	disconnect(): void;
}
