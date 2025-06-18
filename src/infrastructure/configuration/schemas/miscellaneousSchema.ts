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
}).required();
