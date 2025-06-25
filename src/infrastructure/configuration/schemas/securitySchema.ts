import Joi from "joi";

/**
 * Joi schema for the server's miscellaneous configuration.
 */
export const securitySchema = Joi.object({
	cookie: Joi.object({
		enabled: Joi.boolean().default(false),
		version: Joi.number().default(1),
		secure: Joi.boolean().default(true),
		expiry: Joi.number().default(3600000), // 1 hour in milliseconds
	}).required(),
	cors: Joi.object({
		origin: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).required(),
		allowedHeaders: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).required(),
		methods: Joi.array().items(Joi.string()).required(),
		credentials: Joi.boolean().default(true),
		maxAge: Joi.number().optional(),
	}).required(),
	bearer: Joi.object({
		enabled: Joi.boolean().default(false),
		header: Joi.string().default("Authorization"),
	}).required(),
}).required();
