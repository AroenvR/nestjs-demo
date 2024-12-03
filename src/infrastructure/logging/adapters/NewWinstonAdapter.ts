import path from 'path';
import winston from 'winston';
import { createLogger, format, Logger, transports } from 'winston';
import { TransformableInfo } from 'logform';
import { LoggerService } from '@nestjs/common';
import { ILoggerConfig } from '../ILoggerConfig';

/**
 * A custom adapter for integrating Winston with NestJS.
 * This adapter supports logging to console, file, and HTTP transports,
 * with custom log levels and flexible formatting.
 * @implements The {@link LoggerService} interface from NestJS.
 */
export class NewWinstonAdapter implements LoggerService {
    private readonly logger: Logger;

    constructor(private readonly config: ILoggerConfig) {
        const winstonTransports: winston.transport[] = [];
        if (config.console) winstonTransports.push(this.configuredConsoleTransport());
        if (config.file.enabled) winstonTransports.push(this.configuredFileTransport());
        if (config.http.enabled) winstonTransports.push(this.configuredHttpTransport());

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
        this.logger = createLogger({
            levels: customLevels,
            level: config.level || 'info', // Default log level
            transports: winstonTransports,
        });
    }

    public verbose(message: string, context?: string) {
        this.logger.verbose(message, { context });
    }

    public debug(message: string, context?: string) {
        this.logger.debug(message, { context });
    }

    public info(message: string, context?: string) {
        this.logger.info(message, { context });
    }

    public log(message: string, context?: string) {
        this.logger.log('normal', message, { context });
    }

    public warn(message: string, context?: string) {
        this.logger.warn(message, { context });
    }

    public error(message: string, context?: string, error?: Error) {
        // if (context instanceof Error) this.logger.error(message, { context: context.stack });
        this.logger.error(message, { context, error });
    }

    public critical(message: string, context?: string) {
        this.logger.log('critical', message, { context });
    }

    /**
     * Configures the console transport for logging.
     * @returns The Winston console transport if enabled, otherwise undefined.
     */
    private configuredConsoleTransport() {
        if (!this.config.console) return;

        return new transports.Console({
            format: format.combine(
                format.timestamp(),
                format.printf(this.formatTextMessage),
            ),
        });
    }

    /**
     * Configures the file transport for logging.
     * @returns The Winston file transport if enabled, otherwise undefined.
     */
    private configuredFileTransport() {
        if (!this.config.file.enabled) return;

        const jsonFormat = format.combine(format.timestamp(), format.json());
        const textFormat = format.combine(
            format.timestamp(),
            format.printf(this.formatTextMessage),
        );

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
            format: format.combine(format.timestamp(), format.json()),
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
    private formatTextMessage(info: TransformableInfo) { // TODO: Correlation ID
        if (info.level === "normal") info.level = "log";
        if (info.error && info.error instanceof Error) info.error = `\n${info.error.stack}`;

        return `${info.timestamp} ${undefined} ${info.level.toUpperCase()} - ${info.context ? `${info.context}` : ''}: ${info.message} ${info.error ? info.error : ''}`;
    }
}
