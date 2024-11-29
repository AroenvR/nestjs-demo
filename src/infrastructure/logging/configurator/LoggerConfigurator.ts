import fs from 'fs-extra';
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

	constructor(opts?: TLoggerLoadOptions) {
		if (opts) this._opts = opts;
	}

	/**
	 *
	 */
	public loadConfiguration(fallbackConfig?: ILoggerConfig): ILoggerConfig {
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
				this.config = JSON.parse(fs.readFileSync(this.opts.path, 'utf8'));
				break;

			case 'object':
				this.config = this.opts.config;
				break;

			default:
				this.config = fallbackConfig;
				break;
		}

		if (!this.config) throw new Error(`${this.name}: Configuration could not be loaded.`);
		return this.config;
	}

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
