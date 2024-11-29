import fs from 'fs-extra';
// import Ajv from 'ajv';
// import addFormats from 'ajv-formats';
import { ILoggerConfigurator } from './ILoggerConfigurator';
import { ILoggerConfig, TLoggerLoadOptions } from '../ILopggerConfig';

/**
 * Class responsible for loading and providing logger configuration settings.
 * @implements The {@link ILoggerConfigurator} interface.
 */
export class LoggerConfigurator implements ILoggerConfigurator {
	private readonly name = 'LoggerConfigurator';
	private _opts: TLoggerLoadOptions | null = null;
	private _config: ILoggerConfig | null = null;
	// private ajv = addFormats(new Ajv());

	constructor(opts?: TLoggerLoadOptions) {
		if (opts) this._opts = opts;
	}

	/**
	 *
	 */
	public loadConfiguration(fallbackConfig?: ILoggerConfig): ILoggerConfig {
		// Set a fallback configuration failsafe.
		// if (!fallbackConfig) fallbackConfig = defaultConfiguration;

		// If the environment variable LOGSCRIBE_CONFIG is set, load the configuration from the specified file.
		if (process.env.LOGSCRIBE_CONFIG) {
			this._config = JSON.parse(fs.readFileSync(process.env.LOGSCRIBE_CONFIG, 'utf8'));
			return this.config;
		}

		// If no options are provided, return the default configuration.
		if (!this.opts || !this.opts.loader) {
			this.config = fallbackConfig;
			return this.config;
		}

		// Load the configuration based on the provided options.
		switch (this.opts.loader) {
			case 'file':
				this._config = JSON.parse(fs.readFileSync(this.opts.path, 'utf8'));
				break;

			case 'object':
				this._config = this.opts.config;
				break;

			default:
				this.config = fallbackConfig;
				break;
		}

		// this.validateConfig(this.config);
		return this.config;
	}

	// /**
	//  *
	//  */
	// public validateConfig(config: ILoggerConfig): boolean {
	// 	const validate = this.ajv.compile(loggerConfigSchema);
	// 	const valid = validate(config);

	// 	if (!valid) throw new Error(`${this.name}: Configuration did not pass JSON Schema validation: ${JSON.stringify(validate.errors)}`);

	// 	return valid;
	// }

	/* Getters & Setters */

	public get opts(): TLoggerLoadOptions | null {
		return this._opts;
	}

	public get config(): ILoggerConfig {
		if (!this._config) throw new Error(`${this.name}: Configuration has not been loaded.`);
		return this._config;
	}

	private set config(config: ILoggerConfig) {
		this._config = config;
	}
}
