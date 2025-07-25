import Joi from "joi";
import { taskManagerDefaultConfig } from "../interfaces/tasks/taskManagerDefaultConfig";

/**
 * The CacheManagerAdapter's configuration schema.
 */
const cacheAdapterSchema = Joi.object({
	ttl: Joi.number()
		.integer()
		.positive()
		.min(1 * 60 * 1000) // 1 minute
		.max(15 * 60 * 1000) // 15 minutes
		.default(5 * 60 * 1000) // 5 minutes
		.optional(),
	refreshThreshold: Joi.number()
		.integer()
		.positive()
		.min(15 * 1000) // 15 seconds
		.max(60 * 1000) // 1 minute
		.default(30 * 1000) // 30 seconds
		.optional(),
	nonBlocking: Joi.boolean().default(true).optional(),
}).required();

/**
 * The PQTaskManager's configuration schema.
 */
const taskManagerSchema = Joi.object({
	concurrentTasks: Joi.number()
		.integer()
		.positive()
		.min(1) // Minimum 1 concurrent task
		.max(10) // Maximum 10 concurrent tasks // TOOD: Try dynamic concurrency generation and monitor a stable resource consumption.
		.default(taskManagerDefaultConfig.concurrentTasks)
		.optional(),
	defaultTaskOptions: Joi.object({
		timeoutMs: Joi.number()
			.integer()
			.positive()
			.min(1000) // Minimum timeout of 1 second for any task to be aborted.
			.max(5 * 1000) // Maximum timeout of 5 seconds for any task to be aborted, the tasks can overwrite this individually.
			.default(taskManagerDefaultConfig.defaultTaskOptions.timeoutMs)
			.optional(),
		allowedRetries: Joi.number()
			.integer()
			.min(0) // Practically disable task retrying.
			.max(10) // Maximally allow a task to be retried 10 times.
			.default(taskManagerDefaultConfig.defaultTaskOptions.allowedRetries)
			.optional(),
		throwOnTimeout: Joi.boolean().default(taskManagerDefaultConfig.defaultTaskOptions.throwOnTimeout).optional(),
		throwOnFailedRetries: Joi.boolean().default(taskManagerDefaultConfig.defaultTaskOptions.throwOnFailedRetries).optional(),
	}).optional(),
	shutdown: Joi.object({
		waitForIdle: Joi.boolean().default(taskManagerDefaultConfig.shutdown.waitForIdle).optional(),
		finishAbovePriority: Joi.number()
			.integer()
			.min(0) // Allow the server to finish all queues before shutting down.
			.max(9000) // I don't know why you would need a default a priority above 9000.
			.default(taskManagerDefaultConfig.shutdown.finishAbovePriority)
			.optional(),
	}).required(),
}).required();

/**
 * Joi schema for the server's security configuration.
 */
export const miscellaneousSchema = Joi.object({
	appStatusInterval: Joi.number()
		.integer()
		.positive()
		.min(1000) // 1 second
		.max(60000) // 60 seconds
		.default(10000) // 10 seconds
		.optional(),
	cache: cacheAdapterSchema,
	tasks: taskManagerSchema,
}).required();
