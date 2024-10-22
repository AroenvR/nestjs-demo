// src/config/schemas/security.schema.ts
import Joi from 'joi';

export const securitySchema = Joi.object({
	secure_cookie: Joi.boolean().required(),
}).required();
