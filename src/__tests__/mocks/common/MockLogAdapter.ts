import { IPrefixedLogger } from "../../../common/utility/logging/ILogger";
import { ICorrelationManager } from "../../../common/utility/logging/correlation/ICorrelationManager";
import { serverConfig } from "../../../infrastructure/configuration/serverConfig";
import { CorrelationManager } from "../../../common/utility/logging/correlation/CorrelationManager";
import { ILoggerConfig } from "src/infrastructure/configuration/interfaces/ILoggerConfig";

/**
 * MockLogAdapter provides a mocked implementation of the {@link IPrefixedLogger} interface for testing purposes.
 */
export class MockLogAdapter implements IPrefixedLogger {
	public readonly config: ILoggerConfig;
	public readonly correlationManager: ICorrelationManager;

	constructor(config?: ILoggerConfig, correlationManager?: ICorrelationManager) {
		if (!config) this.config = serverConfig().logging;
		if (!correlationManager) this.correlationManager = new CorrelationManager();
	}

	verbose = jest.fn();
	debug = jest.fn();
	info = jest.fn();
	log = jest.fn();
	warn = jest.fn();
	error = jest.fn();
	critical = jest.fn();

	getPrefixedLogger = jest.fn().mockImplementation(() => {
		return {
			config: this.config,
			correlationManager: this.correlationManager,
			verbose: this.verbose,
			debug: this.debug,
			info: this.info,
			log: this.log,
			warn: this.warn,
			error: this.error,
			critical: this.log,
		};
	});
}
