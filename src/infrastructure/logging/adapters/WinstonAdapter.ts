import path from 'path';
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';
import { TMetadata } from '../ILogger';
import { AbstractAdapter } from './AbstractAdapter';
import { TLogLevels } from '../ILopggerConfig';

/**
 * The Adapter responsible for logging messages using the Winston library.
 * @extends LogAdapter The base class for all log adapters.
 */
export class WinstonAdapter extends AbstractAdapter<winston.Logger> {
	protected name = 'WinstonAdapter';

	protected create() {
		const customLevels = {
			critical: 0,
			error: 1,
			warn: 2,
			normal: 3, // log (log is used by winston)
			info: 4,
			debug: 5,
			verbose: 6,
		};

		const transports: winston.transport[] = [];

		if (this.config.console) {
			transports.push(new winston.transports.Console(this.configureConsoleTransport()));
		}

		if (this.config.file.enabled) {
			transports.push(new winston.transports.File(this.configureFileTransport()));
		}

		if (this.config.http.enabled) {
			transports.push(new winston.transports.Http(this.configureHttpTransport()));
		}

		const logger = winston.createLogger({
			levels: customLevels,
			transports: transports,
		});

		return logger;
	}

	/**
	 * Writes a log entry with the given level, message, and extra data.
	 * @param level The log level (e.g., 'info', 'debug', 'error', etc.).
	 * @param message The log message.
	 * @param extra Optional extra data to include in the log entry.
	 */
	protected handle(level: TLogLevels, message: string, metadata?: TMetadata): void {
		this.logger.log(level, message, { metadata });
	}

	/**
	 * Formats the log message with the given level, message, and extra data for a log transport.
	 * @param level The log level of the message to output.
	 * @param message The message to output.
	 * @param extra The extra data to include in the log entry.
	 */
	private formatMessage(level: string, message: string, extra: TMetadata): string {
		const now = new Date();
		const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;

		let msg = `${timestamp} ${this.config.appName}`;
		msg += this.config.enableCorrelation && this.correlationManager ? ` ${this.correlationManager.getCorrelationId()}` : '';
		msg += ` ${level.toUpperCase()} - ${message} ${extra}`;
		return msg;
	}

	/**
	 * Configures the console transport based on the ILoggerConfig.
	 * @returns A winston.transports.ConsoleTransportOptions instance.
	 */
	private configureConsoleTransport(): winston.transports.ConsoleTransportOptions {
		return {
			level: this.config.level,
			silent: !this.config.console,
			format: winston.format.printf(({ level, message, metadata }) => {
				if (level === 'normal') level = 'log'; // winston uses 'log' for the 'normal' level

				let extra = '';
				if (metadata instanceof Error) {
					extra = `${metadata.name}: ${metadata.message}`;

					if (this.config.level === 'verbose' || this.config.level === 'debug') {
						if (metadata.stack)
							extra = metadata.stack
								.split('\n')
								.map((line) => line)
								.join('\n');
					}
				} else extra = metadata ? JSON.stringify(metadata, null, 4) : '';

				return this.formatMessage(level, message as string, extra); // TODO: Verify it's a string?
			}),
		};
	}

	/**
	 * Configures the file transport based on the ILoggerConfig.
	 * @returns A winston.transports.FileTransportOptions instance.
	 */
	private configureFileTransport(): winston.transports.FileTransportOptions {
		if (!this.config.file.enabled) throw new Error(`${this.name}: Config file is not enabled while trying to configure file transport.`);

		if (!this.config.file.name) this.config.file.name = `${this.config.appName}_${new Date().toISOString().replace(/[:.]/g, '-')}.log`;
		if (!this.config.file.path) this.config.file.path = path.join(__dirname, '../', '../', 'logs');

		return {
			level: this.config.level,
			filename: path.join(this.config.file.path, this.config.file.name),
			silent: !this.config.file.enabled,
			format: winston.format.printf(({ level, message, metadata }) => {
				if (level === 'normal') level = 'log'; // winston uses 'log' for the 'normal' level

				let extra = '';
				if (metadata instanceof Error) {
					extra = `${metadata.name}: ${metadata.message}`;

					if (this.config.level === 'verbose') {
						if (metadata.stack) extra = metadata.stack.replace(/\n/g, '');
					}
				} else extra = metadata ? JSON.stringify(metadata) : '';

				return this.formatMessage(level, message as string, extra); // TODO: Verify it's a string?
			}),
		};
	}

	/**
	 * Configures the HTTP transport based on the ILoggerConfig.
	 * **Does not log any debug logging level.**
	 * @param config - ILoggerConfig object containing the logger configuration.
	 * @returns A winston.transports.HttpTransportOptions instance.
	 * @deprecated This method was never tested and may not work as expected.
	 */
	private configureHttpTransport(): winston.transports.HttpTransportOptions {
		return {
			level: this.config.level === 'debug' ? 'info' : this.config.level,
			silent: !this.config.http.enabled,
			host: 'localhost',
			path: `/${uuidv4()}`,
			ssl: true,
			auth: {
				bearer: process.env.BEARER_TOKEN,
			},
			format: winston.format.printf(({ level, message, metadata }) => {
				if (level === 'normal') level = 'log'; // winston uses 'log' for the 'normal' level

				const payload = {
					appName: this.config.appName,
					correlationId: this.config.enableCorrelation && this.correlationManager ? ` ${this.correlationManager.getCorrelationId()}` : '',
					level: level.toUpperCase(),
					timestamp: new Date().getTime(),
					message: message,
					metadata:
						metadata instanceof Error
							? {
									error: true,
									name: metadata.name,
									message: metadata.message,
									stack: metadata.stack,
								}
							: metadata,
				};

				return JSON.stringify(payload);
			}),
		};
	}
}
