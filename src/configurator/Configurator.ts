import fs from 'fs-extra';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

/**
 * The options for loading the logger configuration settings.
 * @property loader The loader to use for loading the configuration settings.
 * @property path The path to the configuration file.
 * @property config The configuration settings to load.
 * @devnote
 * If the loader is set to 'file', the path property is required.
 * If the loader is set to 'object', the config property is required.
 */
export type TLoadOpts<Config> =
	| {
			loader: 'file';
			path: string;
	  }
	| {
			loader: 'object';
			config: Config;
	  };

/**
 * Class responsible for loading and providing configuration settings.
 */
export class Configurator<Config> {
	private readonly name = 'Configurator';
	private _opts: TLoadOpts<Config> | null = null;
	private _config: Config | null = null;
	private jsonSchema: object;
	private envVar: string;
	private ajv = addFormats(new Ajv());

	constructor(jsonSchema: object, envVar: string, opts: TLoadOpts<Config>) {
		this.jsonSchema = jsonSchema;
		this.envVar = envVar;
		this._opts = opts;
	}

	/**
	 * Loads the configuration settings.
	 * @returns The configuration settings for the logger.
	 * @devnote
	 * Will check the according environment variable for a configuration file first.
	 * If the environment variable is not set, it will load the configuration based on the provided options.
	 * If no options are provided, it will return the default configuration.
	 */
	public loadConfiguration(): Config {
		// If the environment variable is set, load the configuration from the specified file.
		if (process.env[this.envVar]) {
			this.config = JSON.parse(fs.readFileSync(process.env[this.envVar], 'utf8'));
			this.validateConfig(this.config);
			return this.config;
		}

		// Load the configuration based on the provided options.
		switch (this.opts.loader) {
			case 'file':
				this.config = JSON.parse(fs.readFileSync(this.opts.path, 'utf8'));
				break;

			case 'object':
				this.config = this.opts.config;
				break;

			default:
				throw new Error(`${this.name}: A loader must be specified.`);
		}

		this.validateConfig(this.config);
		return this.config;
	}

	/**
	 * Validates the configuration settings using AJV.
	 * @param config The configuration settings to validate.
	 */
	public validateConfig(config: Config): boolean {
		const validate = this.ajv.compile(this.jsonSchema);
		const valid = validate(config);

		if (!valid) throw new Error(`${this.name}: Configuration did not pass JSON Schema validation: ${JSON.stringify(validate.errors)}`);

		return valid;
	}

	/* Getters & Setters */

	public get opts(): TLoadOpts<Config> | null {
		return this._opts;
	}

	public get config(): Config {
		if (!this._config) throw new Error(`${this.name}: Configuration has not been loaded.`);
		return this._config;
	}

	private set config(config: Config) {
		this._config = config;
	}
}
