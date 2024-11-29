import Joi from 'joi';

/**
 * Joi schema for TLoggerFileConfig.
 */
const loggerFileConfigSchema = Joi.object({
	enabled: Joi.boolean().required(),
	path: Joi.when('enabled', {
		is: true,
		then: Joi.string().required(),
		otherwise: Joi.forbidden(),
	}),
	style: Joi.when('enabled', {
		is: true,
		then: Joi.string().required().valid('json', 'text'),
		otherwise: Joi.forbidden(),
	}),
	name: Joi.when('enabled', {
		is: true,
		then: Joi.string().required(),
		otherwise: Joi.forbidden(),
	}),
	_comment: Joi.any().optional(), // Allow _comment field
});

/**
 * Joi schema for TLoggerHTTPConfig.
 */
const loggerHTTPConfigSchema = Joi.object({
	enabled: Joi.boolean().required(),
	host: Joi.when('enabled', {
		is: true,
		then: Joi.string().required(),
		otherwise: Joi.forbidden(),
	}),
	path: Joi.when('enabled', {
		is: true,
		then: Joi.number().required(),
		otherwise: Joi.forbidden(),
	}),
	token: Joi.when('enabled', {
		is: true,
		then: Joi.string().required(),
		otherwise: Joi.forbidden(),
	}),
});

/**
 * Joi schema for ILoggerConfig.
 */
export const loggingSchema = Joi.object({
	appName: Joi.string().required(),
	driver: Joi.string().valid('winston').required(),
	enableCorrelation: Joi.boolean().required(),
	level: Joi.string().valid('verbose', 'debug', 'info', 'log', 'warn', 'error', 'critical').required(),
	console: Joi.boolean().required(),
	file: loggerFileConfigSchema.required(),
	http: loggerHTTPConfigSchema.required(),
	useWhitelist: Joi.boolean().required(),
	prefixWhitelist: Joi.array().items(Joi.string()).required(),
}).required();
