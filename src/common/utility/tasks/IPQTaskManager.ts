import { TaskOptions } from "p-queue/dist/options";
import { DefaultPQTaskOptions, IPQTaskManagerConfig } from "../../../infrastructure/configuration/interfaces/tasks/IPQTaskManagerConfig";
import { UUID } from "crypto";

/**
 * The type definition for a priority queue (PQ) task's identifier.
 * This ensures that the task manager can adapt to implementations requirements.
 */
export type PQTaskIdentifier = UUID;

/**
 * Interface for a single task in the priority queue (PQ).
 * @property taskId - An optional ID to be able to check the task's progress at a later stage.
 * Extends the {@link DefaultPQTaskOptions} to include additional task-specific options.
 */
export interface PQTaskOptions extends DefaultPQTaskOptions {
	taskId?: PQTaskIdentifier;
}

/**
 * This interface represents the server's priority queue (PQ) task manager.
 * @property config - The Task Manager's configuration object.
 * @property isIdle - Whether the task is currently idle.
 * @property isPaused - Whether the task is currently paused.
 * @property isShuttingDown - Whether the task is currently shutting down.
 */
export interface IPQTaskManager {
	config: IPQTaskManagerConfig;
	isIdle: boolean;
	isPaused: boolean;
	isShuttingDown: boolean;

	/**
	 * Adds a task to the priority task queue.
	 * @param task Optional {@link TaskOptions} can be given to handle f.ex. cancelling the task.
	 * @param options Optional overrides for the task's behaviour.
	 */
	addToQueue<T>(task: (opts?: TaskOptions) => Promise<T>, options?: PQTaskOptions): Promise<T>;

	/**
	 * Cancel a task by its ID.
	 * @param taskId The ID of the task to cancel.
	 */
	cancel(taskId: PQTaskIdentifier): void;

	/**
	 * Gracefully shuts down the task manager.
	 * Shutdown behavior is defined by the Manager's configuration object.
	 */
	shutdown(): Promise<void>;

	/**
	 * Clears all pending (not running) tasks from all queues.
	 * @param queueId Optionally specify a queue ID to clear only that queue.
	 */
	clearQueues(queueId?: number): void;

	/**
	 * Gets all of the active priority queue id's.
	 * Id's are sorted by the highest priority queue first, at index 0.
	 */
	getPriorityQueueIds(): number[];

	/**
	 * Gets the number of currently queued (waiting) tasks.
	 * @param queueId Get a specific priority queue's size.
	 */
	getQueueSize(queueId?: number): number;

	/**
	 * Gets the number of currently running (active) tasks.
	 * @param queueId Get a specific priority queue's active tasks.
	 */
	getActiveCount(queueId?: number): number;

	/**
	 * Gets the number of retry attempts made so far on the currently active task.
	 * @param taskId Optionally request a specific task's current retry count.
	 */
	getCurrentRetryCount(taskId?: PQTaskIdentifier): number;

	/**
	 * Pauses all task executions.
	 */
	pauseQueues(): void;

	/**
	 * Resumes task execution with the highest priority task going first.
	 */
	resumeQueues(): void;
}
