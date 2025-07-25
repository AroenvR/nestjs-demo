import Joi from "joi";
import { securitySchema } from "./schemas/securitySchema";
import { databaseSchema } from "./schemas/databaseSchema";
import { loggingSchema } from "./schemas/loggingSchema";
import { miscellaneousSchema } from "./schemas/miscellaneousSchema";
import { externalApiAdapterConfigSchema } from "./schemas/externalApiAdapterConfigSchema";

/**
 * JSON schema for the NestJS server.
 */
export const serverJsonSchema = Joi.object({
	security: securitySchema,
	logging: loggingSchema,
	database: databaseSchema,
	misc: miscellaneousSchema,
	external: Joi.array().items(externalApiAdapterConfigSchema).required(),
}).required();
