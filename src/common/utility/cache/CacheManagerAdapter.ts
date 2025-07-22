import { Injectable, OnModuleDestroy, Scope } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cache, createCache } from "cache-manager";
import { IServerConfig } from "../../../infrastructure/configuration/IServerConfig";
import { ILogger } from "../../../infrastructure/logging/ILogger";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";
import { CacheKeys } from "../../../common/enums/CacheKeys";
import { mockPlainTextBearerToken } from "../../../__tests__/mocks/mockJwt";

/**
 * Adapter for `cache-manager`, providing a shared in-memory cache
 * with sliding TTL and background refresh support.
 * - Configured via `misc_config.cache` in server configuration.
 * - Implements standard cache operations: get, set, del, clear.
 */
@Injectable({ scope: Scope.DEFAULT })
export class CacheManagerAdapter implements OnModuleDestroy {
	protected logger: ILogger;
	protected cache: Cache;

	constructor(
		protected readonly logAdapter: WinstonAdapter,
		protected readonly configService: ConfigService,
	) {
		this.logger = logAdapter.getPrefixedLogger(this.constructor.name);
		this.cache = this.setupCache();

		if (process.env.NODE_ENV === "test") this.setupTestJwtData();
	}

	/**
	 * Reads a value from cache by key.
	 * @param key Unique cache key
	 * @returns The cached value or undefined if not found
	 */
	public async get<T>(key: string): Promise<T | undefined> {
		try {
			const result = await this.cache.get<T>(key);
			if (result === undefined) this.logger.debug(`Cache miss: ${key}`);
			else this.logger.debug(`Cache hit: ${key}`);

			return result;
		} catch (err) {
			this.logger.error(`Cache get error for ${key}`, err);
			return undefined;
		}
	}

	/**
	 * Stores a value in cache under the given key.
	 * @param key Unique cache key
	 * @param value Value to cache
	 * @param ttl Optional TTL override (ms)
	 */
	public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
		try {
			await this.cache.set(key, value, ttl);
			this.logger.debug(`Cache set: ${key} (ttl=${ttl ?? "default"})`);
		} catch (err) {
			this.logger.error(`Cache set error for ${key}`, err as Error);
		}
	}

	/**
	 * Stores multiple entries in cache.
	 * @param entries Array of { key, value, ttl? }
	 */
	public async setMultiple<T>(entries: { key: string; value: T; ttl?: number }[]): Promise<void> {
		try {
			await Promise.all(entries.map((entry) => this.cache.set(entry.key, entry.value, entry.ttl)));
			this.logger.debug(`Cache setMultiple: [${entries.map((e) => e.key).join(", ")}]`);
		} catch (err) {
			this.logger.error("Cache setMultiple error", err as Error);
		}
	}

	/**
	 * Deletes a key from cache.
	 * @param key Cache key to remove
	 */
	public async del(key: string): Promise<void> {
		try {
			await this.cache.del(key);
			this.logger.debug(`Cache delete: ${key}`);
		} catch (err) {
			this.logger.error(`Cache delete error for ${key}`, err as Error);
		}
	}

	/**
	 * Clears all entries from the cache.
	 */
	async clear(): Promise<void> {
		try {
			await this.cache.clear?.();
			this.logger.info("Cache cleared");
		} catch (err) {
			this.logger.error("Cache clear error", err);
		}
	}

	/**
	 * Clean up resources on shutdown.
	 */
	public async onModuleDestroy() {
		await this.cache.disconnect?.();
	}

	/**
	 *
	 */
	private setupCache() {
		const config = this.configService.get<IServerConfig["misc"]>("misc").cache;

		return createCache({
			ttl: config.ttl,
			refreshThreshold: config.refreshThreshold,
			nonBlocking: config.nonBlocking,
		});
	}

	/**
	 *
	 */
	private setupTestJwtData() {
		this.logger.warn("Seeding cache for mock JWTs in test env");

		// seed the "JWT_JTI" entry for your bearer mocks
		this.cache.set<boolean>(CacheKeys.JWT_JTI + mockPlainTextBearerToken.jti, true);

		// seed the "USER_UUID" entry for your bearer mocks
		this.cache.set<boolean>(CacheKeys.USER_UUID + mockPlainTextBearerToken.sub, true);
	}
}
