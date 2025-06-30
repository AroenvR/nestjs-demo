import Joi from "joi";

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
	cache: Joi.object({
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
	}).required(),
}).required();
