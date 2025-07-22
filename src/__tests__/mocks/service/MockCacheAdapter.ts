import { CacheManagerAdapter } from "../../../common/utility/cache/CacheManagerAdapter";

/**
 * A mock {@link CacheManagerAdapter} for testing purposes.
 */
export class MockCacheManagerAdapter implements Partial<CacheManagerAdapter> {
	private store = new Map<string, any>();

	/** Simulate CacheManagerAdapter.get */
	async get<T = any>(key: string): Promise<T | undefined> {
		return this.store.get(key);
	}

	/** Simulate CacheManagerAdapter.set */
	async set<T = any>(key: string, value: T, _?: number): Promise<void> {
		this.store.set(key, value);
	}

	/** Simulate CacheManagerAdapter.setMultiple */
	async setMultiple<T = any>(entries: { key: string; value: T; _?: number }[]): Promise<void> {
		for (const { key, value } of entries) {
			this.store.set(key, value);
		}
	}

	/** Simulate CacheManagerAdapter.del */
	async del(key: string): Promise<void> {
		this.store.delete(key);
	}

	/** Simulate CacheManagerAdapter.clear */
	async clear(): Promise<void> {
		this.store.clear();
	}

	/** Helper for your tests to inspect state directly */
	dump(): Map<string, any> {
		return new Map(this.store);
	}
}
