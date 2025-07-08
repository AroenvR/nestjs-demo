import Joi from "joi";

/**
 * The minimum configuration required to set up a connection with an external API.
 * @property ssl - Whether HTTP or HTTPS should be used.
 * @property domain - Which domain to connect to.
 * @property port - Which port to use.
 * @property events - Whether event consuming should be initialized or not.
 */
export interface IExternalConfig extends Record<string, unknown> {
	ssl: boolean;
	domain: string;
	port: number;
	events: boolean;
}

/**
 *
 * @param object
 */
export const assertExternalConfigSchema = (config: IExternalConfig) => {
	if (!config || typeof config !== "object") throw new Error(`JSON schema: ValidationError: config is not an object`);

	const IExternalConfigSchema = Joi.object({
		ssl: Joi.boolean().required(),
		domain: Joi.string().required(),
		port: Joi.number().required(),
		events: Joi.boolean().required(),
	});

	const { error } = IExternalConfigSchema.validate(config, { abortEarly: false });
	if (error) {
		throw error;
	}
};
