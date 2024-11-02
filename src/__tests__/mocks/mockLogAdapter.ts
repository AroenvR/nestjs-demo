import { ILogger } from 'ts-log-adapter';
import { LogAdapter } from '../../infrastructure/logging/LogAdapter';

/**
 * A mocked ILogger object.
 */
export const mockILogger: jest.Mocked<ILogger> = {
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

export const mockLogAdapter = new LogAdapter(mockILogger);
