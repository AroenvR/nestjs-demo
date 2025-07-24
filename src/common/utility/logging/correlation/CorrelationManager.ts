import { AsyncLocalStorage } from "node:async_hooks";
import { ICorrelationManager } from "./ICorrelationManager";

/**
 * The correlation manager class, responsible for managing the correlation id for a callback.
 * @implements The {@link ICorrelationManager} interface.
 */
export class CorrelationManager implements ICorrelationManager {
	private asyncLocalStorage: AsyncLocalStorage<string>;

	constructor(asyncLocalStorage?: AsyncLocalStorage<string>) {
		if (asyncLocalStorage) this.asyncLocalStorage = asyncLocalStorage;
		else this.asyncLocalStorage = new AsyncLocalStorage();
	}

	/**
	 *
	 */
	public runWithCorrelationId(correlationId: string, callback: () => unknown): void {
		this.asyncLocalStorage.run(correlationId, callback);
	}

	/**
	 *
	 */
	public getCorrelationId(): string | undefined {
		return this.asyncLocalStorage.getStore();
	}
}
