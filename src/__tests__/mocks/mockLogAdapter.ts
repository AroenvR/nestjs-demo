import { IPrefixedLogger } from "../../infrastructure/logging/ILogger";

/**
 * Mocked {@link IPrefixedLogger} for testing purposes.
 */
export const mockILogger: jest.Mocked<IPrefixedLogger> = {
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
	getPrefixedLogger: jest.fn((_: string) => mockILogger),
};
