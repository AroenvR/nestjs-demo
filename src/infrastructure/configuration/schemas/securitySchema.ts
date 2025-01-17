// src/config/schemas/security.schema.ts
import Joi from 'joi';

/**
 * Joi schema for the server's security configuration.
 */
export const securitySchema = Joi.object({
	secure_cookie: Joi.boolean().required(),
	cors: Joi.object({
		origin: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).required(),
		allowedHeaders: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).required(),
		methods: Joi.array().items(Joi.string()).required(),
		credentials: Joi.boolean().default(true),
		maxAge: Joi.number().optional(),
	}).required(),
}).required();
