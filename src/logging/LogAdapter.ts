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

	verbose(message: any, ...optionalParams: any[]) {
		this.logger.verbose(message, optionalParams[0]);
	}

	debug(message: any, ...optionalParams: any[]): any {
		this.logger.debug(message, optionalParams[0]);
	}

	info(message: any, ...optionalParams: any[]): any {
		this.logger.info(message, optionalParams[0]);
	}

	log(message: any, ...optionalParams: any[]): any {
		this.logger.log(message, optionalParams[0]);
	}

	warn(message: any, ...optionalParams: any[]): any {
		this.logger.warn(message, optionalParams[0]);
	}

	error(message: any, ...optionalParams: any[]): any {
		this.logger.error(message, optionalParams[0]);
	}

	fatal(message: any, ...optionalParams: any[]) {
		this.logger.critical(message, optionalParams[0]);
	}

	getLogger(): ILogger {
		return this.logger;
	}

	getPrefixedLogger(prefix: string): ILogger {
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
