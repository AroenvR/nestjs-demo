/**
 * Interface for the Task Manager's priority queue (PQ) shutdown options.
 * @property waitForIdle - Whether to wait for all tasks to complete before shutting down.
 * @property finishAbovePriority - If set, tasks with a priority above this value will be completed before shutdown.
 * @devnote Check the [defaults object](./taskManagerDefaultConfig.ts) for the default configuration.
 */
export interface PQTaskShutdownOptions {
	waitForIdle?: boolean;
	finishAbovePriority?: number;
}

/**
 * Default options for tasks in the priority queue (PQ).
 * @property queueId - Defines which priority queue this task will be added to. 0 is the lowest priority queue.
 * @property timeoutMs - Timeout (in milliseconds) after which the task will be aborted if not completed.
 * @property allowedRetries - Maximum number of allowed retry attempts.
 * @property throwOnTimeout - Whether to throw an error if the task times out.
 * @property throwOnFailedRetries - Whether to throw an error if the task fails after all retries.
 * @devnote Check the [defaults object](./taskManagerDefaultConfig.ts) for the default configuration.
 */
export interface DefaultPQTaskOptions {
	queueId?: number;
	timeoutMs?: number;
	allowedRetries?: number;
	throwOnTimeout?: boolean;
	throwOnFailedRetries?: boolean;
}

/**
 * Options interface for the Priority Queue (PQ) Task Manager.
 * @property shutdown - Optionally define how the Task Manager should handle the shutdown process.
 * @property defaultTaskOptions - Sets the default options for tasks in the priority queue.
 * @property concurrentTasks - The amount of tasks to run concurrently.
 * @devnote Check the [defaults object](./taskManagerDefaultConfig.ts) for the default configuration.
 */
export interface IPQTaskManagerConfig {
	concurrentTasks: number;
	defaultTaskOptions: DefaultPQTaskOptions;
	shutdown: PQTaskShutdownOptions;
}
