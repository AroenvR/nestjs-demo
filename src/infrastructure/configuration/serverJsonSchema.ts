import Joi from 'joi';
import { securitySchema } from './schemas/securitySchema';
import { databaseSchema } from './schemas/databaseSchema';
import { loggingSchema } from './schemas/loggingSchema';

/**
 * JSON schema for the NestJS server.
 */
export const serverJsonSchema = Joi.object({
	security: securitySchema,
	logging: loggingSchema,
	database: databaseSchema,
}).required();
