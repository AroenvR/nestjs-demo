import Joi from "joi";
import { SUPPORTED_AES_ALGORITHMS } from "../../../common/utility/aes/TSupportedAesAlgorithms";

/**
 * Joi schema for the server's miscellaneous configuration.
 */
export const securitySchema = Joi.object({
	cookie: Joi.object({
		enabled: Joi.boolean().default(false).optional(),
		version: Joi.number().default(1).optional(),
		secure: Joi.boolean().default(true).optional(),
		expiry: Joi.number()
			.integer()
			.positive()
			.min(60 * 60 * 0.5) // 30 minutes in seconds
			.max(60 * 60 * 24) // 24 hours in seconds
			.default(60 * 60 * 1) // 1 hour in seconds
			.optional(),
		maxAge: Joi.number()
			.integer()
			.positive()
			.min(1000 * 60 * 60 * 4) // 4 hours in milliseconds
			.max(1000 * 60 * 60 * 24 * 7) // 7 days in milliseconds
			.default(1000 * 60 * 60 * 16) // 16 hours in milliseconds
			.optional(),
	}).required(),
	bearer: Joi.object({
		enabled: Joi.boolean().default(false).optional(),
		header: Joi.string().default("Authorization").optional(),
		encryption: Joi.string()
			.valid(...SUPPORTED_AES_ALGORITHMS)
			.default("aes-256-gcm")
			.optional(),
		expiry: Joi.number()
			.integer()
			.positive()
			.min(60 * 1) // 1 minute in seconds
			.max(60 * 60) // 1 hour in seconds
			.default(60 * 15) // 15 minutes in seconds
			.optional(),
	}).required(),
	jwks: Joi.object({
		enabled: Joi.boolean().default(false).optional(),
		cache: Joi.boolean().default(true).optional(),
		cacheMaxEntries: Joi.number().integer().positive().min(3).max(25).default(10).optional(),
		cacheMaxAge: Joi.number()
			.integer()
			.positive()
			.min(15 * 60 * 1000) // 15 minutes in milliseconds
			.max(60 * 60 * 1000) // 1 hour in milliseconds
			.default(30 * 60 * 1000) // half an hour in milliseconds
			.optional(),
		timeout: Joi.number().integer().positive().min(2500).max(10000).default(5000).optional(),
		rateLimit: Joi.boolean().default(true).optional(),
		jwtksPerMinute: Joi.number().integer().positive().min(1).max(10).default(5).optional(),
		jwksUri: Joi.string().required(),
		requestAgentCertPath: Joi.string().valid("").optional(),
		issuer: Joi.string().required(),
		audience: Joi.string().required(),
		algorithms: Joi.array().items(Joi.string().required()).required(),
	}).optional(),
	swagger: Joi.object({
		enabled: Joi.boolean().default(false).optional(),
	}).required(),
	cors: Joi.object({
		origin: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).required(),
		allowedHeaders: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).required(),
		methods: Joi.array().items(Joi.string()).required(),
		credentials: Joi.boolean().default(true).optional(),
		maxAge: Joi.number().optional(),
	}).required(),
}).required();
