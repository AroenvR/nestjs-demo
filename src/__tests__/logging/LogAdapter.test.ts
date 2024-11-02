import { LogAdapter } from '../../infrastructure/logging/LogAdapter';
import { ILogger } from 'ts-log-adapter';

describe('LogAdapter', () => {
	let mockILogger: jest.Mocked<ILogger>;
	let logAdapter: LogAdapter;

	beforeEach(() => {
		mockILogger = {
			config: {
				appName: 'API_TEST',
				driver: 'winston',
				enableCorrelation: true,
				level: 'verbose',
				console: false,
				file: {
					enabled: true,
					path: 'logs',
					name: 'LogAdapter.test.log',
				},
				http: {
					enabled: false,
				},
				useWhitelist: false,
				prefixWhitelist: [],
			},
			correlationManager: {
				getCorrelationId: jest.fn(),
				runWithCorrelationId: jest.fn(),
			},
			verbose: jest.fn(),
			debug: jest.fn(),
			info: jest.fn(),
			log: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
			critical: jest.fn(),
		};

		logAdapter = new LogAdapter(mockILogger);
	});

	// --------------------------------------------------

	it('should be defined', () => {
		expect(logAdapter).toBeDefined();
	});

	// --------------------------------------------------

	describe('logging methods', () => {
		it('should call verbose method of ILogger', () => {
			const message = 'Test verbose message';
			const metadata = { key: 'value' };

			logAdapter.verbose(message, metadata);

			expect(mockILogger.verbose).toHaveBeenCalledWith(message, metadata);
		});

		// --------------------------------------------------

		it('should call debug method of ILogger', () => {
			const message = 'Test debug message';
			const metadata = { key: 'value' };

			logAdapter.debug(message, metadata);

			expect(mockILogger.debug).toHaveBeenCalledWith(message, metadata);
		});

		// --------------------------------------------------

		it('should call info method of ILogger', () => {
			const message = 'Test info message';
			const metadata = { key: 'value' };

			logAdapter.info(message, metadata);

			expect(mockILogger.info).toHaveBeenCalledWith(message, metadata);
		});

		// --------------------------------------------------

		it('should call log method of ILogger', () => {
			const message = 'Test log message';
			const metadata = { key: 'value' };

			logAdapter.log(message, metadata);

			expect(mockILogger.log).toHaveBeenCalledWith(message, metadata);
		});

		// --------------------------------------------------

		it('should call warn method of ILogger', () => {
			const message = 'Test warn message';
			const metadata = { key: 'value' };

			logAdapter.warn(message, metadata);

			expect(mockILogger.warn).toHaveBeenCalledWith(message, metadata);
		});

		// --------------------------------------------------

		it('should call error method of ILogger', () => {
			const message = 'Test error message';
			const metadata = { key: 'value' };

			logAdapter.error(message, metadata);

			expect(mockILogger.error).toHaveBeenCalledWith(message, metadata);
		});

		// --------------------------------------------------

		it('should call fatal method of ILogger as critical', () => {
			const message = 'Test fatal message';
			const metadata = { key: 'value' };

			logAdapter.fatal(message, metadata);

			expect(mockILogger.critical).toHaveBeenCalledWith(message, metadata);
		});
	});

	// --------------------------------------------------

	describe('getLogger', () => {
		it('should return the underlying ILogger instance', () => {
			const logger = logAdapter.getLogger();

			expect(logger).toBe(mockILogger);
		});
	});

	// --------------------------------------------------

	describe('getPrefixedLogger', () => {
		it('should return a prefixed ILogger', () => {
			const prefix = 'Prefix';
			const prefixedLogger = logAdapter.getPrefixedLogger(prefix);

			expect(prefixedLogger).toBeDefined();
			expect(prefixedLogger).not.toBe(mockILogger);

			const message = 'Test message';
			const metadata = { key: 'value' };

			prefixedLogger.info(message, metadata);

			expect(mockILogger.info).toHaveBeenCalledWith(`${prefix}: ${message}`, metadata);
		});

		// --------------------------------------------------

		it('should preserve config and correlationManager', () => {
			const prefix = 'Prefix';
			const prefixedLogger = logAdapter.getPrefixedLogger(prefix);

			expect(prefixedLogger.config).toBe(mockILogger.config);
			expect(prefixedLogger.correlationManager).toBe(mockILogger.correlationManager);
		});

		// --------------------------------------------------

		it('should prefix all logging methods', () => {
			const prefix = 'Prefix';
			const prefixedLogger = logAdapter.getPrefixedLogger(prefix);

			const message = 'Test message';
			const metadata = { key: 'value' };

			prefixedLogger.verbose(message, metadata);
			prefixedLogger.debug(message, metadata);
			prefixedLogger.info(message, metadata);
			prefixedLogger.log(message, metadata);
			prefixedLogger.warn(message, metadata);
			prefixedLogger.error(message, metadata);
			prefixedLogger.critical(message, metadata);

			expect(mockILogger.verbose).toHaveBeenCalledWith(`${prefix}: ${message}`, metadata);
			expect(mockILogger.debug).toHaveBeenCalledWith(`${prefix}: ${message}`, metadata);
			expect(mockILogger.info).toHaveBeenCalledWith(`${prefix}: ${message}`, metadata);
			expect(mockILogger.log).toHaveBeenCalledWith(`${prefix}: ${message}`, metadata);
			expect(mockILogger.warn).toHaveBeenCalledWith(`${prefix}: ${message}`, metadata);
			expect(mockILogger.error).toHaveBeenCalledWith(`${prefix}: ${message}`, metadata);
			expect(mockILogger.critical).toHaveBeenCalledWith(`${prefix}: ${message}`, metadata);
		});
	});
});
