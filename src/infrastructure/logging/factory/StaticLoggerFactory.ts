// import { ICorrelationManager } from '../ICorrelationManager';
// import { ILogger, TMetadata } from '../ILogger';
// import { ILoggerConfig } from '../ILopggerConfig';

// /**
//  * A static factory class for creating logger instances.
//  */
// export class StaticLoggerFactory {
// 	private static instance: ILogger;

// 	/**
// 	 * Returns a singleton logger instance.
// 	 * @returns {ILogger} A logger instance.
// 	 */
// 	public static getLogger(): ILogger {
// 		if (!StaticLoggerFactory.instance) throw new Error('StaticLoggerFactory: Logger instance not initialized.');
// 		return StaticLoggerFactory.instance;
// 	}

// 	/**
// 	 * Returns a prefixed logger instance.
// 	 * @param prefix The prefix to prepend to log messages.
// 	 * @returns {ILogger} A logger instance.
// 	 */
// 	public static getPrefixedLogger(prefix: string): ILogger {
// 		const prefixedLogger: ILogger = {
// 			config: StaticLoggerFactory.instance.config,
// 			correlationManager: StaticLoggerFactory.instance.correlationManager,
// 			verbose: (message: string, metadata?: TMetadata) => StaticLoggerFactory.instance.verbose(`${prefix}: ${message}`, metadata),
// 			debug: (message: string, metadata?: TMetadata) => StaticLoggerFactory.instance.debug(`${prefix}: ${message}`, metadata),
// 			info: (message: string, metadata?: TMetadata) => StaticLoggerFactory.instance.info(`${prefix}: ${message}`, metadata),
// 			log: (message: string, metadata?: TMetadata) => StaticLoggerFactory.instance.log(`${prefix}: ${message}`, metadata),
// 			warn: (message: string, metadata?: TMetadata) => StaticLoggerFactory.instance.warn(`${prefix}: ${message}`, metadata),
// 			error: (message: string, metadata?: TMetadata) => StaticLoggerFactory.instance.error(`${prefix}: ${message}`, metadata),
// 			critical: (message: string, metadata?: TMetadata) => StaticLoggerFactory.instance.critical(`${prefix}: ${message}`, metadata),
// 		};

// 		return prefixedLogger;
// 	}

// 	/**
// 	 * Initializes the logger instance based on the provided configuration settings.
// 	 * @param configurator The configurator for loading the logger configuration settings.
// 	 * @param correlationManager The correlation manager for managing correlation IDs.
// 	 * @returns {ILogger} A logger instance.
// 	 */
// 	public static initialize(config: ILoggerConfig, correlationManager?: ICorrelationManager): ILogger {
// 		this.instance = this.createAdapter(config, correlationManager);
// 		return this.instance;
// 	}

// 	/**
// 	 * Creates a logger instance based on the provided configuration settings.
// 	 * @param config The configuration settings for the logger.
// 	 * @param correlationManager The correlation manager for managing correlation IDs.
// 	 * @returns {ILogger} A logger instance.
// 	 */
// 	private static createAdapter(config: ILoggerConfig, correlationManager?: ICorrelationManager): ILogger {
// 		switch (config.driver) {
// 			case 'winston':
// 				return new WinstonAdapter(config, correlationManager);

// 			default:
// 				throw new Error(`StaticLoggerFactory: Unsupported logger driver: ${config.driver}`);
// 		}
// 	}
// }
