import { ICorrelationManager } from '../correlation/ICorrelationManager';
import { ILogger } from '../ILogger';
import { ILoggerConfig } from '../ILoggerConfig';

/**
 * Factory interface for creating logger instances.
 * @property instance The singleton logger instance.
 */
export interface ILoggerFactory {
    instance: ILogger;

    /**
     * Returns a singleton logger instance.
     * @returns {ILogger} A logger instance.
     */
    getLogger(): ILogger;

    /**
     * Returns a prefixed logger instance.
     * @param prefix The prefix to prepend to log messages.
     * @returns {ILogger} A logger instance.
     */
    getPrefixedLogger(prefix: string): ILogger;

    /**
     * Initializes the logger instance based on the provided configuration settings.
     * @param configurator The configurator for loading the logger configuration settings.
     * @param correlationManager The correlation manager for managing correlation IDs.
     * @returns {ILogger} A logger instance.
     */
    initialize(configurator: ILoggerConfig, correlationManager?: ICorrelationManager): ILogger;
}
