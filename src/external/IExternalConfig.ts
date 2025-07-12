import Joi from "joi";

/**
 * The minimum configuration required to set up a connection with an external API.
 * @property ssl - Whether HTTP or HTTPS should be used.
 * @property domain - Which domain to connect to.
 * @property port - Which port to use.
 * @property events - Whether event consuming should be initialized or not.
 */
export interface IExternalConfig extends Record<string, unknown> {
	key: string;
	ssl: boolean;
	domain: string;
	port: number;
	events: string[];
}

/**
 * Joi schema for the external API configuration.
 * This schema validates the structure of the an external API configuration object.
 */
export const externalApiAdapterConfigSchema = Joi.object({
	key: Joi.string().min(1).required(),
	ssl: Joi.boolean().default(true).optional(),
	domain: Joi.string().required(),
	port: Joi.number().integer().positive().default(443).optional(),
	events: Joi.array().items(Joi.string().optional()).optional(),
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
