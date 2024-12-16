import { LoggerService } from '@nestjs/common';
import { ICorrelationManager } from './correlation/ICorrelationManager';
import { ILoggerConfig } from './ILoggerConfig'; // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * Type definition for metadata that can be attached to log messages.
 * Can be a simple key-value record or an Error object for logging exceptions.
 */
export type TLogMetadata = Record<string, unknown> | Error | unknown;

/**
 * ILogger interface defines the structure for logging mechanisms within the package.
 * It provides methods for logging at various levels from detailed debug information to critical errors.
 * @property config The {@link ILoggerConfig} settings for the logger.
 * @property correlationManager An optional {@link ICorrelationManager} for managing correlation IDs in between async funtions.
 * @extends LoggerService The {@link LoggerService} interface from the NestJS package.
 */
export interface ILogger extends LoggerService {
	// config: ILoggerConfig;
	correlationManager: ICorrelationManager | null;

	/**
	 * Logs verbose messages, intended for detailed internal state logging.
	 * Should be used for tracing module logs and understanding application flow.
	 * Not recommended for use in production due to its level of verbosity.
	 * @param message The log message.
	 * @param metadata Additional metadata for the log message.
	 */
	verbose(message: string, metadata?: TLogMetadata): void;

	/**
	 * Logs debug messages, potentially containing sensitive information.
	 * Useful for debugging during development but should be avoided in production environments.
	 * @param message The log message.
	 * @param metadata Additional metadata for the log message.
	 */
	debug(message: string, metadata?: TLogMetadata): void;

	/**
	 * Logs informational messages that highlight the progress of the application at a coarse-grained level.
	 * Suitable for use in both development and production environments.
	 * @param message The log message.
	 * @param metadata Additional metadata for the log message.
	 */
	info(message: string, metadata?: TLogMetadata): void;

	/**
	 * General logging method, primarily used for backward compatibility or custom log levels.
	 * @param message The log message.
	 * @param metadata Additional metadata for the log message.
	 */
	log(message: string, metadata?: TLogMetadata): void;

	/**
	 * Logs warning messages indicating potential issues that are not necessarily errors but might require attention.
	 * @param message The log message.
	 * @param metadata Additional metadata for the log message.
	 */
	warn(message: string, metadata?: TLogMetadata): void;

	/**
	 * Logs error messages, indicating failures that should be immediately addressed.
	 * @param message The log message.
	 * @param metadata Additional metadata for the log message.
	 */
	error(message: string, metadata?: TLogMetadata): void;

	/**
	 * Logs critical messages, representing severe problems or crashes in the application.
	 * These should trigger alerts and require immediate attention.
	 * @param message The log message.
	 * @param metadata Additional metadata for the log message.
	 */
	critical(message: string, metadata?: TLogMetadata): void;
}

/**
 *
 */
export interface IPrefixedLogger extends ILogger {
	/**
	 *
	 * @param context
	 */
	getPrefixedLogger(context: string): ILogger;
}
