// src/config/schemas/security.schema.ts
import Joi from 'joi';

/**
 * Joi schema for the server's security configuration.
 */
export const securitySchema = Joi.object({
	secure_cookie: Joi.boolean().required(),
}).required();
