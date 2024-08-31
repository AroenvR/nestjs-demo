import { LoggerService, LogLevel } from "@nestjs/common";
// import { ILogger } from "ts-log-adapter";

/**
 * An adapter for the ts-log-adapter library.
 */
export class LogAdapter implements LoggerService { // Implement adapter interface
    // private logger: ILogger;

    // constructor(logger: ILogger) {
    //     this.logger = logger;
    // }

    verbose(message: any, ...optionalParams: any[]) {
        // this.logger.verbose(message, optionalParams[0]);
    }

    debug(message: any, ...optionalParams: any[]): any {
        // this.logger.debug(message, optionalParams[0]);
    }

    info(message: any, ...optionalParams: any[]): any {
        // this.logger.debug(message, optionalParams[0]);
        console.info(message, ...optionalParams);
    }

    log(message: any, ...optionalParams: any[]): any {
        // this.logger.log(message, optionalParams[0]);
        console.log(message, ...optionalParams);
    }

    warn(message: any, ...optionalParams: any[]): any {
        // this.logger.warn(message, optionalParams[0]);
    }

    error(message: any, ...optionalParams: any[]): any {
        // this.logger.error(message, optionalParams[0]);
    }

    fatal(message: any, ...optionalParams: any[]) {
        // this.logger.critical(message, optionalParams[0]);
    }

    setLogLevels(levels: LogLevel[]) {
        throw new Error("Method not implemented.");
    }
}