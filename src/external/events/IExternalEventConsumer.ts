/**
 * doc
 */
export interface IExternalEventConsumer {
	/**
	 * doc
	 * @param eventsUrl
	 * @param callback
	 */
	setup(eventsUrl: URL, callback: (data: unknown) => Promise<void>): void;

	/**
	 * doc
	 */
	connect(): Promise<void>;
}
