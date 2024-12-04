import path from 'path';
import winston from 'winston';
import { createLogger, format, Logger, transports } from 'winston';
import { TransformableInfo } from 'logform';
import { ILoggerConfig } from '../ILoggerConfig';
import { ICorrelationManager } from '../correlation/ICorrelationManager';
import { ILogger, IPrefixedLogger, TLogMetadata } from '../ILogger';

/**
 * A custom adapter for integrating Winston with NestJS.
 * This adapter supports logging to console, file, and HTTP transports,
 * with custom log levels and flexible formatting.
 * @implements The {@link ILogger} interface.
 */
export class NewWinstonAdapter implements IPrefixedLogger {
    private readonly winston: Logger;

    constructor(
        protected readonly config: ILoggerConfig,
        public readonly correlationManager: ICorrelationManager,
    ) {
        const winstonTransports: winston.transport[] = [];
        if (config.console) winstonTransports.push(this.configuredConsoleTransport());
        if (config.file.enabled) winstonTransports.push(this.configuredFileTransport());
        if (config.http.enabled) winstonTransports.push(this.configuredHttpTransport());
        if (winstonTransports.length === 0) throw new Error(`${this.name}: No logging transports enabled.`);

        const customLevels = {
            critical: 0,
            error: 1,
            warn: 2,
            normal: 3, // log (log is used by winston)
            info: 4,
            debug: 5,
            verbose: 6,
        };

        // Create the Winston Logger
        this.winston = createLogger({
            levels: customLevels,
            level: config.level || 'info', // Fallback log level
            transports: winstonTransports,
        });
    }

    public verbose(context: string, message: string, metadata?: TLogMetadata) {
        this.winston.verbose(message, { context, metadata });
    }

    public debug(context: string, message: string, metadata?: TLogMetadata) {
        this.winston.debug(message, { context, metadata });
    }

    public info(context: string, message: string, metadata?: TLogMetadata) {
        this.winston.info(message, { context, metadata });
    }

    public log(context: string, message: string, metadata?: TLogMetadata) {
        this.winston.log('normal', message, { context, metadata });
    }

    public warn(context: string, message: string, metadata?: TLogMetadata) {
        this.winston.warn(message, { context, metadata });
    }

    public error(context: string, message: string, metadata?: TLogMetadata) {
        this.winston.error(message, { context, metadata });
    }

    public fatal(context: string, message: string, metadata?: TLogMetadata) {
        this.critical('critical', message, { context, metadata });
    }

    public critical(context: string, message: string, metadata?: TLogMetadata) {
        this.winston.log('critical', message, { context, metadata });
    }

    /**
     *
     * @param context
     * @returns
     */
    public getPrefixedLogger(context: string): ILogger {
        const prefixedLogger: ILogger = {
            // config: this.config,
            correlationManager: this.correlationManager,
            verbose: (message: string, metadata?: TLogMetadata) => this.verbose(context, message, metadata),
            debug: (message: string, metadata?: TLogMetadata) => this.debug(context, message, metadata),
            info: (message: string, metadata?: TLogMetadata) => this.info(context, message, metadata),
            log: (message: string, metadata?: TLogMetadata) => this.log(context, message, metadata),
            warn: (message: string, metadata?: TLogMetadata) => this.warn(context, message, metadata),
            error: (message: string, metadata?: TLogMetadata) => this.error(context, message, metadata),
            critical: (message: string, metadata?: TLogMetadata) => this.log(context, message, metadata),
        };

        return prefixedLogger;
    }

    /**
     * Configures the console transport for logging.
     * @returns The Winston console transport if enabled, otherwise undefined.
     */
    private configuredConsoleTransport() {
        if (!this.config.console) return;

        return new transports.Console({
            format: format.combine(format.timestamp(), format.printf(this.formatTextMessage)),
        });
    }

    /**
     * Configures the file transport for logging.
     * @returns The Winston file transport if enabled, otherwise undefined.
     */
    private configuredFileTransport() {
        if (!this.config.file.enabled) return;

        const jsonFormat = format.combine(format.timestamp(), format.printf(this.formatJsonMessage));
        const textFormat = format.combine(format.timestamp(), format.printf(this.formatTextMessage));

        const fullFilePath = path.join(this.config.file.path, this.config.file.name);

        if (this.config.file.style === 'json') return new transports.File({ filename: fullFilePath, format: jsonFormat });
        else if (this.config.file.style === 'text') return new transports.File({ filename: fullFilePath, format: textFormat });
    }

    /**
     * Configures the HTTP transport for logging.
     * @returns The Winston HTTP transport if enabled, otherwise undefined.
     */
    private configuredHttpTransport() {
        if (!this.config.http.enabled) return;

        return new transports.Http({
            format: format.combine(format.timestamp(), format.printf(this.formatJsonMessage)),
            host: this.config.http.host,
            path: this.config.http.path,
            ssl: true,
            auth: {
                bearer: this.config.http.token,
            },
        });
    }

    /**
     * Formats text-based log messages.
     * @param info - The log message information.
     * @returns The formatted text log message.
     */
    private formatTextMessage(info: TransformableInfo) {
        if (info.level === 'normal') info.level = 'log';

        if (info.metadata && info.metadata instanceof Error) info.metadata = `\n${info.metadata.stack}`;
        else if (info.metadata && typeof info.metadata === 'object') info.metadata = JSON.stringify(info.metadata);

        let message = info.timestamp + ' ';
        message += this.correlationManager?.getCorrelationId() + ' ';
        message += info.level.toUpperCase() + ' - ';
        message += info.context ? `${info.context}: ` : '';
        message += info.message + ' ';
        message += info.metadata ? info.metadata : '';

        return message;
    }

    /**
     * Formats JSON-based log messages using the
     * [Serilog Compact Formatting](https://github.com/serilog/serilog-formatting-compact).
     * @param info - The log message information.
     * @returns The formatted JSON log message.
     */
    private formatJsonMessage(info: TransformableInfo) {
        if (info.level === 'normal') info.level = 'log';

        if (info.metadata && info.metadata instanceof Error) info.error = `\n${info.metadata.stack}`;
        else if (info.metadata && typeof info.metadata === 'object') info.metadata = JSON.stringify(info.metadata);

        const obj = {
            '@t': info.timestamp,
            '@l': info.level.toUpperCase(),
            '@cid': this.correlationManager?.getCorrelationId() || '',
            '@c': info.context ? info.context : '',
            '@m': info.message,
            '@x': info.error ? info.error : '',
            '@md': info.metadata ? info.metadata : '',
        };
        return JSON.stringify(obj);
    }

    /* Getters & Setters */

    public get name(): string {
        return this.constructor.name;
    }
}
