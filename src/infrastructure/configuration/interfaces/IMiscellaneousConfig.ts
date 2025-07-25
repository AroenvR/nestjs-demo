import { IPQTaskManagerConfig } from "./tasks/IPQTaskManagerConfig";

/**
 * The server's cache configuration.
 * @property ttl - The default Time-To-Live of a cached item before it's deleted.
 * @property refreshThreshold - The default
 * @property nonBlocking - Whether a cache check should be a blocking operation or not.
 */
export interface ICacheConfig {
	ttl: number;
	refreshThreshold: number;
	nonBlocking: boolean;
}

/**
 * The server's miscellaneous configuration interface.
 * @property appStatusInterval - The interval in milliseconds for checking the application status.
 * @property cache - The server's cache configuration.
 * @property tasks - The server's tasks queue configuration.
 */
export interface IMiscellaneousConfig {
	appStatusInterval: number;
	cache: ICacheConfig;
	tasks: IPQTaskManagerConfig;
}
