import Joi from "joi";
import { SUPPORTED_AES_ALGORITHMS } from "../../../common/utility/aes/TSupportedAesAlgorithms";

/**
 * Joi schema for the server's miscellaneous configuration.
 */
export const securitySchema = Joi.object({
	cookie: Joi.object({
		enabled: Joi.boolean().default(false),
		version: Joi.number().default(1),
		secure: Joi.boolean().default(true),
		expiry: Joi.number()
			.integer()
			.positive()
			.min(60 * 60 * 0.5) // 30 minutes in seconds
			.max(60 * 60 * 24) // 24 hours in seconds
			.default(60 * 60 * 1), // 1 hour in seconds
		maxAge: Joi.number()
			.integer()
			.positive()
			.min(1000 * 60 * 60 * 4) // 4 hours in milliseconds
			.max(1000 * 60 * 60 * 24 * 7) // 7 days in milliseconds
			.default(1000 * 60 * 60 * 16), // 16 hours in milliseconds
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
		encryption: Joi.string()
			.valid(...SUPPORTED_AES_ALGORITHMS)
			.default("aes-256-gcm"),
		expiry: Joi.number()
			.integer()
			.positive()
			.min(60 * 1) // 1 minute in seconds
			.max(60 * 60) // 1 hour in seconds
			.default(60 * 15), // 15 minutes in seconds
	}).required(),
	swagger: Joi.object({
		enabled: Joi.boolean().default(false),
	}).required(),
}).required();
