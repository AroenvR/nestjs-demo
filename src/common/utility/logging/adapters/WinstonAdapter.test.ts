import { WinstonAdapter } from "./WinstonAdapter";
import { CorrelationManager } from "../correlation/CorrelationManager";
import { randomUUID } from "node:crypto";
import { ILoggerConfig } from "../../../../infrastructure/configuration/interfaces/ILoggerConfig";

// Mock Winston's createLogger and its methods
const mockedLoggerMethods = {
	verbose: jest.fn(),
	debug: jest.fn(),
	info: jest.fn(),
	log: jest.fn(),
	warn: jest.fn(),
	error: jest.fn(),
	critical: jest.fn(),
};

jest.mock("winston", () => ({
	createLogger: jest.fn(() => mockedLoggerMethods),
	transports: {
		Console: jest.fn(),
		File: jest.fn(),
	},
	format: {
		combine: jest.fn(),
		timestamp: jest.fn(),
		printf: jest.fn(),
		json: jest.fn(),
	},
}));

const CONFIG: ILoggerConfig = {
	appName: "FileTest",
	driver: "winston",
	enableCorrelation: true,
	level: "verbose",
	console: true,
	file: {
		enabled: true,
		path: "TEST_LOG_DIR",
		style: "text",
		name: "TEST_LOG_FILENAME",
	},
	http: {
		enabled: false,
	},
	database: false,
	useWhitelist: true,
	prefixWhitelist: [
		"VerboseContext",
		"DebugContext",
		"InfoContext",
		"LogContext",
		"WarnContext",
		"ErrorContext",
		"CriticalContext",
		"console",
		"TEST",
	],
};

const TEST_NAME = "WinstonAdapter";
describe(TEST_NAME, () => {
	process.env.TEST_NAME = TEST_NAME;
	let adapter: WinstonAdapter;

	beforeEach(() => {
		const correlation = new CorrelationManager();
		adapter = new WinstonAdapter(CONFIG, correlation);
	});

	// ------------------------------

	it("should call logger.verbose when verbose is invoked", () => {
		adapter.verbose("VerboseContext", "verbose message");
		expect(mockedLoggerMethods.verbose).toHaveBeenCalledWith("verbose message", { context: "VerboseContext" });
	});

	// ------------------------------

	it("should call logger.debug when debug is invoked", () => {
		adapter.debug("DebugContext", "debug message");
		expect(mockedLoggerMethods.debug).toHaveBeenCalledWith("debug message", { context: "DebugContext" });
	});

	// ------------------------------

	it("should call logger.info when log is invoked", () => {
		adapter.info("InfoContext", "info message");
		expect(mockedLoggerMethods.info).toHaveBeenCalledWith("info message", { context: "InfoContext" });
	});

	// ------------------------------

	it("should call logger.log when log is invoked", () => {
		// Due to Winston having a `log` method, we need to use the `normal` level and overwrite it later in the adapter.

		adapter.log("LogContext", "log message");
		expect(mockedLoggerMethods.log).toHaveBeenCalledWith("normal", "log message", { context: "LogContext" });
	});

	// ------------------------------

	it("should call logger.warn when warn is invoked", () => {
		adapter.warn("WarnContext", "warn message");
		expect(mockedLoggerMethods.warn).toHaveBeenCalledWith("warn message", { context: "WarnContext" });
	});

	// ------------------------------

	it("should call logger.error when error is invoked", () => {
		adapter.error("ErrorContext", "error message");
		expect(mockedLoggerMethods.error).toHaveBeenCalledWith("error message", { context: "ErrorContext" });
	});

	// ------------------------------

	it("should call logger.critical when critical is invoked", () => {
		// Due to Winston not having a `critical` level, we call the `log` method and overwrite the level in the adapter.

		adapter.critical("CriticalContext", "critical message");
		expect(mockedLoggerMethods.log).toHaveBeenCalledWith("critical", "critical message", { context: "CriticalContext" });
	});

	// ------------------------------

	it("does not log a non-whitelisted context", () => {
		adapter.info("UnwhiteListedContext", "Yolo");
		expect(mockedLoggerMethods.info).not.toHaveBeenCalledWith("Yolo", { context: "UnwhiteListedContext" });
	});

	// ------------------------------

	it('should overwrite console methods to call logger.verbose if level is "verbose"', () => {
		console.debug("test debug", { key: "value" });
		console.info("test info", { key: "value" });
		console.log("test log", { key: "value" });
		console.warn("test warn", { key: "value" });
		console.error("test error", { key: "value" });

		// Verify logger.verbose is called for each method
		expect(mockedLoggerMethods.verbose).toHaveBeenCalledWith("test debug", { context: "console.debug", metadata: { key: "value" } });
		expect(mockedLoggerMethods.verbose).toHaveBeenCalledWith("test info", { context: "console.info", metadata: { key: "value" } });
		expect(mockedLoggerMethods.verbose).toHaveBeenCalledWith("test log", { context: "console.log", metadata: { key: "value" } });
		expect(mockedLoggerMethods.verbose).toHaveBeenCalledWith("test warn", { context: "console.warn", metadata: { key: "value" } });
		expect(mockedLoggerMethods.verbose).toHaveBeenCalledWith("test error", { context: "console.error", metadata: { key: "value" } });
	});

	// ------------------------------

	it("logs with correlation Id's", async () => {
		const firstCorrelationId = randomUUID();
		const secondCorrelationId = randomUUID();

		adapter.correlationManager.runWithCorrelationId(firstCorrelationId, () => {
			adapter.info("TEST", "This is an info message.", { key: "value" });

			adapter.correlationManager.runWithCorrelationId(secondCorrelationId, () => {
				adapter.log("TEST", "This is a log message.", { key: "value" });
			});
		});

		expect(mockedLoggerMethods.info).toHaveBeenCalledWith("This is an info message.", {
			context: "TEST",
			metadata: { key: "value" },
			correlationId: firstCorrelationId,
		});
		expect(mockedLoggerMethods.log).toHaveBeenCalledWith("normal", "This is a log message.", {
			context: "TEST",
			metadata: { key: "value" },
			correlationId: secondCorrelationId,
		});
	});

	// ------------------------------

	test.skip('should not log anything from the console if the level is not "verbose"', () => {
		// TODO: Fix...
		const NON_VERBOSE_CONFIG = CONFIG;
		NON_VERBOSE_CONFIG.level = "info";

		// Initialize the adapter
		adapter = new WinstonAdapter(NON_VERBOSE_CONFIG, new CorrelationManager());

		// Mock console.log to track calls
		const consoleLogSpy = jest.spyOn(console, "log");

		// Call console.log
		console.log("test log");

		// Assert that console.log is not called
		expect(consoleLogSpy).not.toHaveBeenCalled();
	});
});
