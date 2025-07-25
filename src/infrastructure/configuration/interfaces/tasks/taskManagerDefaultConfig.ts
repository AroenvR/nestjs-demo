import { IPQTaskManagerConfig } from "./IPQTaskManagerConfig";

/**
 * The Task Manager's default configuration object.
 */
export const taskManagerDefaultConfig: IPQTaskManagerConfig = {
	concurrentTasks: 1,
	defaultTaskOptions: {
		queueId: 0,
		timeoutMs: 1000,
		allowedRetries: 3,
		throwOnTimeout: false,
		throwOnFailedRetries: false,
	},
	shutdown: {
		waitForIdle: false,
		finishAbovePriority: 100,
	},
};
