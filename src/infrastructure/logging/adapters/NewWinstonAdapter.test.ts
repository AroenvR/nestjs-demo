import { NewWinstonAdapter } from './NewWinstonAdapter';
import { ILoggerConfig } from '../ILoggerConfig';
import { CorrelationManager } from '../correlation/CorrelationManager';

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

jest.mock('winston', () => ({
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
	appName: 'FileTest',
	driver: 'winston',
	enableCorrelation: true,
	level: 'verbose',
	console: false,
	file: {
		enabled: true,
		path: 'TEST_LOG_DIR',
		style: 'text',
		name: 'TEST_LOG_FILENAME',
	},
	http: {
		enabled: false,
	},
	useWhitelist: true,
	prefixWhitelist: ['TEST', 'console.log'],
};

const TEST_NAME = 'NewWinstonAdapter';
describe(TEST_NAME, () => {
	process.env.TEST_NAME = TEST_NAME;
	let adapter: NewWinstonAdapter;

	beforeEach(() => {
		const correlation = new CorrelationManager();
		adapter = new NewWinstonAdapter(CONFIG, correlation);
	});

	// ------------------------------

	it('should call logger.verbose when verbose is invoked', () => {
		adapter.verbose('VerboseContext', 'verbose message');
		expect(mockedLoggerMethods.verbose).toHaveBeenCalledWith('verbose message', { context: 'VerboseContext' });
	});

	// ------------------------------

	it('should call logger.debug when debug is invoked', () => {
		adapter.debug('DebugContext', 'debug message');
		expect(mockedLoggerMethods.debug).toHaveBeenCalledWith('debug message', { context: 'DebugContext' });
	});

	// ------------------------------

	it('should call logger.info when log is invoked', () => {
		adapter.info('InfoContext', 'info message');
		expect(mockedLoggerMethods.info).toHaveBeenCalledWith('info message', { context: 'InfoContext' });
	});

	// ------------------------------

	it('should call logger.log when log is invoked', () => {
		// Due to Winston having a `log` method, we need to use the `normal` level and overwrite it later in the adapter.

		adapter.log('LogContext', 'log message');
		expect(mockedLoggerMethods.log).toHaveBeenCalledWith('normal', 'log message', { context: 'LogContext' });
	});

	// ------------------------------

	it('should call logger.warn when warn is invoked', () => {
		adapter.warn('WarnContext', 'warn message');
		expect(mockedLoggerMethods.warn).toHaveBeenCalledWith('warn message', { context: 'WarnContext' });
	});

	// ------------------------------

	it('should call logger.error when error is invoked', () => {
		adapter.error('ErrorContext', 'error message');
		expect(mockedLoggerMethods.error).toHaveBeenCalledWith('error message', { context: 'ErrorContext' });
	});

	// ------------------------------

	it('should call logger.critical when critical is invoked', () => {
		// Due to Winston not having a `critical` level, we call the `log` method and overwrite the level in the adapter.

		adapter.critical('CriticalContext', 'critical message');
		expect(mockedLoggerMethods.log).toHaveBeenCalledWith('critical', 'critical message', { context: 'CriticalContext' });
	});
});
