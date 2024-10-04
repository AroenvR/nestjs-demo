import { ILogger } from 'ts-log-adapter';
import { LogAdapter } from '../logging/LogAdapter';

/**
 * An abstract class that provides a prefixed logger instance.
 */
export abstract class AbstractLoggingClass {
	protected logger: ILogger;

	constructor(protected readonly logAdapter: LogAdapter) {
		const name = this.constructor.name;
		this.logger = this.logAdapter.getPrefixedLogger(name);
	}
}
