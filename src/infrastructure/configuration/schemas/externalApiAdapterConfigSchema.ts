import Joi from "joi";
import { IExternalConfig } from "../interfaces/IExternalConfig";

/**
 * Joi schema for the external API configuration.
 */
export const externalApiAdapterConfigSchema = Joi.object({
	key: Joi.string().min(1).required(),
	ssl: Joi.boolean().default(true).optional(),
	domain: Joi.string().required(),
	port: Joi.number().integer().positive().default(443).optional(),
});

/**
 * Asserts that the provided configuration object conforms to the external API configuration schema.
 * @param config - The configuration object to validate.
 * @throws Will throw an error if the configuration does not conform to the schema.
 */
export const assertExternalConfigSchema = (config: IExternalConfig) => {
	if (!config || typeof config !== "object") throw new Error(`JSON schema: ValidationError: config is not an object`);

	const { error } = externalApiAdapterConfigSchema.validate(config, { abortEarly: false });
	if (error) {
		throw error;
	}
};
