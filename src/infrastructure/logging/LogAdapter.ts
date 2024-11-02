import { LoggerService } from '@nestjs/common';
import { ILogger } from 'ts-log-adapter';
import { TMetadata } from 'ts-log-adapter/dist/ILogger';

/**
 * An adapter for the ts-log-adapter library.
 */
export class LogAdapter implements LoggerService {
	private logger: ILogger;

	constructor(logger: ILogger) {
		this.logger = logger;
	}

	public verbose(message: any, ...optionalParams: any[]) {
		this.logger.verbose(message, optionalParams[0]);
	}

	public debug(message: any, ...optionalParams: any[]): any {
		this.logger.debug(message, optionalParams[0]);
	}

	public info(message: any, ...optionalParams: any[]): any {
		this.logger.info(message, optionalParams[0]);
	}

	public log(message: any, ...optionalParams: any[]): any {
		this.logger.log(message, optionalParams[0]);
	}

	public warn(message: any, ...optionalParams: any[]): any {
		this.logger.warn(message, optionalParams[0]);
	}

	public error(message: any, ...optionalParams: any[]): any {
		this.logger.error(message, optionalParams[0]);
	}

	public fatal(message: any, ...optionalParams: any[]) {
		this.logger.critical(message, optionalParams[0]);
	}

	public getLogger(): ILogger {
		return this.logger;
	}

	public getPrefixedLogger(prefix: string): ILogger {
		const prefixedLogger: ILogger = {
			config: this.logger.config,
			correlationManager: this.logger.correlationManager,
			verbose: (message: string, metadata?: TMetadata) => this.logger.verbose(`${prefix}: ${message}`, metadata),
			debug: (message: string, metadata?: TMetadata) => this.logger.debug(`${prefix}: ${message}`, metadata),
			info: (message: string, metadata?: TMetadata) => this.logger.info(`${prefix}: ${message}`, metadata),
			log: (message: string, metadata?: TMetadata) => this.logger.log(`${prefix}: ${message}`, metadata),
			warn: (message: string, metadata?: TMetadata) => this.logger.warn(`${prefix}: ${message}`, metadata),
			error: (message: string, metadata?: TMetadata) => this.logger.error(`${prefix}: ${message}`, metadata),
			critical: (message: string, metadata?: TMetadata) => this.logger.critical(`${prefix}: ${message}`, metadata),
		};

		return prefixedLogger;
	}
}
