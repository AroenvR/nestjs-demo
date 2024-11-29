import path from 'path';
import { ILogger, TMetadata } from '../ILogger';
import { ICorrelationManager } from '../correlation/ICorrelationManager';
import { ILoggerConfig, TLogLevels } from '../ILopggerConfig';

/**
 * The base class for all log adapters.
 * @implements The {@link ILogger} interface.
 */
export abstract class AbstractAdapter<T> implements ILogger {
    protected name = 'AbstractAdapter';
    protected logger: T;
    private _config: ILoggerConfig;
    private _correlationManager: ICorrelationManager | null = null;

    constructor(config: ILoggerConfig, correlationManager?: ICorrelationManager) {
        this._config = config;
        if (!this.config.console && !this.config.file.enabled && !this.config.http.enabled)
            throw new Error(`${this.name}: No logging transports enabled.`);

        if (correlationManager) this._correlationManager = correlationManager;

        // If the environment variable TAIL_TESTING is set to 'true', the log file is written to the logs directory in the project root as tail.test.log.
        if (process.env.TAIL_TESTING === 'true') {
            this.config.file = {
                enabled: true,
                path: path.join(__dirname, '../', '../', 'logs'),
                name: 'tail.test.log',
            };
        }

        this.overwriteConsole();

        this.logger = this.create();
    }

    public verbose(message: string, metadata?: TMetadata): void {
        this.handle('verbose', message, metadata);
    }

    public debug(message: string, metadata?: TMetadata): void {
        if (this.isWhitelistApproved(message)) this.handle('debug', message, metadata);
        else this.handle('verbose', `Unwhitelisted message: ${message}`);
    }

    public info(message: string, metadata?: TMetadata): void {
        if (this.isWhitelistApproved(message)) this.handle('info', message, metadata);
        else this.handle('verbose', `Unwhitelisted message: ${message}`);
    }

    public log(message: string, metadata?: TMetadata): void {
        if (this.isWhitelistApproved(message)) {
            // @ts-expect-error: log is already used by Winston
            this.handle('normal', message, metadata);
        } else this.handle('verbose', `Unwhitelisted message: ${message}`);
    }

    public warn(message: string, metadata?: TMetadata): void {
        if (this.isWhitelistApproved(message)) this.handle('warn', message, metadata);
        else this.handle('verbose', `Unwhitelisted message: ${message}`);
    }

    public error(message: string, metadata?: TMetadata): void {
        if (this.isWhitelistApproved(message)) this.handle('error', message, metadata);
        else this.handle('verbose', `Unwhitelisted message: ${message}`);
    }

    public critical(message: string, metadata?: TMetadata): void {
        if (this.isWhitelistApproved(message)) this.handle('critical', message, metadata);
        else this.handle('verbose', `Unwhitelisted message: ${message}`);
    }

    /**
     * Writes a log entry with the given level, message, and extra data.
     * @param level The log level (e.g., 'info', 'debug', 'error', etc.).
     * @param message The log message.
     * @param extra Optional extra data to include in the log entry.
     */
    protected abstract handle(level: TLogLevels, message: string, metadata?: TMetadata): void;

    /**
     * Creates the logger instance based on the configuration settings.
     */
    protected abstract create(): T;

    /**
     *
     * @param message
     */
    private isWhitelistApproved(message: string): boolean {
        if (!this.config.useWhitelist) return true;

        for (const item of this.config.prefixWhitelist) {
            if (message.startsWith(item)) return true;
        }

        return false;
    }

    /**
     * Overwrites the default console logging functions.
     * If the logging level is set to 'verbose', all console logging functions are overwritten to log to the logger.
     * Otherwise all console logging functions are overwritten to do nothing.
     */
    private overwriteConsole(): void {
        if (this.config.level !== 'verbose') {
            console.debug = () => undefined;
            console.log = () => undefined;
            console.info = () => undefined;
            console.warn = () => undefined;
            console.error = () => undefined;
        } else {
            console.debug = (...args: unknown[]) => {
                this.verbose(`console.debug ${args[0]}`, args[1]);
            };

            console.log = (...args: unknown[]) => {
                this.verbose(`console.log ${args[0]}`, args[1]);
            };

            console.info = (...args: unknown[]) => {
                this.verbose(`console.info ${args[0]}`, args[1]);
            };

            console.warn = (...args: unknown[]) => {
                this.verbose(`console.warn ${args[0]}`, args[1]);
            };

            console.error = (...args: unknown[]) => {
                this.verbose(`console.error ${args[0]}`, args[1]);
            };
        }
    }

    /* Getters & Setters */

    public get config(): ILoggerConfig {
        return this._config;
    }

    public get correlationManager(): ICorrelationManager | null {
        return this._correlationManager;
    }
}
