import Joi from "joi";

/**
 * Joi schema for the server's security configuration.
 */
export const securitySchema = Joi.object({
	cookie: Joi.object({
		version: Joi.number().default(1),
		secure: Joi.boolean().default(true),
		expiry: Joi.number().default(3600000), // 1 hour in milliseconds
	}),
	cors: Joi.object({
		origin: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).required(),
		allowedHeaders: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).required(),
		methods: Joi.array().items(Joi.string()).required(),
		credentials: Joi.boolean().default(true),
		maxAge: Joi.number().optional(),
	}).required(),
}).required();
