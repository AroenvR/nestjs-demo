import { WinstonAdapter } from '../adapters/WinstonAdapter';
import { ICorrelationManager } from '../correlation/ICorrelationManager';
import { ILogger, TMetadata } from '../ILogger';
import { ILoggerConfig } from '../ILoggerConfig';
import { ILoggerFactory } from './ILoggerFactory';

/**
 * Factory class for creating logger instances.
 * @implements The {@link ILoggerFactory} interface.
 */
export class LoggerFactory implements ILoggerFactory {
    private readonly name = 'LoggerFactory';
    protected _instance: ILogger | null = null;

    /**
     *
     */
    public getLogger(): ILogger {
        return this.instance;
    }

    /**
     *
     */
    public getPrefixedLogger(prefix: string): ILogger {
        const prefixedLogger: ILogger = {
            config: this.instance.config,
            correlationManager: this.instance.correlationManager,
            verbose: (message: string, metadata?: TMetadata) => this.instance.verbose(`${prefix}: ${message}`, metadata),
            debug: (message: string, metadata?: TMetadata) => this.instance.debug(`${prefix}: ${message}`, metadata),
            info: (message: string, metadata?: TMetadata) => this.instance.info(`${prefix}: ${message}`, metadata),
            log: (message: string, metadata?: TMetadata) => this.instance.log(`${prefix}: ${message}`, metadata),
            warn: (message: string, metadata?: TMetadata) => this.instance.warn(`${prefix}: ${message}`, metadata),
            error: (message: string, metadata?: TMetadata) => this.instance.error(`${prefix}: ${message}`, metadata),
            critical: (message: string, metadata?: TMetadata) => this.instance.critical(`${prefix}: ${message}`, metadata),
        };

        return prefixedLogger;
    }

    /**
     *
     */
    public initialize(config: ILoggerConfig, correlationManager?: ICorrelationManager): ILogger {
        this.instance = this.createAdapter(config, correlationManager);
        return this.instance;
    }

    /**
     * Creates a logger instance based on the provided configuration settings.
     * @param config The configuration settings for the logger.
     * @param correlationManager The correlation manager for managing correlation IDs.
     * @returns An instance of the {@link ILogger} interface.
     */
    protected createAdapter(config: ILoggerConfig, correlationManager?: ICorrelationManager): ILogger {
        switch (config.driver) {
            case 'winston':
                return new WinstonAdapter(config, correlationManager);

            default:
                throw new Error(`${this.name}: Unsupported logger driver: ${config.driver}`);
        }
    }

    /* Getters & Setters */

    public get instance(): ILogger {
        if (!this._instance) throw new Error(`${this.name}: Logger instance not initialized.`);
        return this._instance;
    }

    protected set instance(instance: ILogger) {
        this._instance = instance;
    }
}
