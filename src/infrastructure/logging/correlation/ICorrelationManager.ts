/**
 * Interface for a correlation Id manager.
 */
export interface ICorrelationManager {
	/**
	 * Run a callback with a correlation id for the duration of the callback.
	 * @param correlationId The correlation id to use for the duration of the callback.
	 * @param callback The callback to run.
	 */
	runWithCorrelationId(correlationId: string, callback: () => void): void;

	/**
	 * Get the current callback's correlation id.
	 * @returns The correlation id for the current callback.
	 */
	getCorrelationId(): string | undefined;
}
