import { WinstonAdapter } from "../../common/utility/logging/adapters/WinstonAdapter";
import { IPrefixedLogger } from "../../common/utility/logging/ILogger";

/**
 * Mocked {@link IPrefixedLogger} for testing purposes.
 */
export const mockILogger: jest.Mocked<IPrefixedLogger> = {
	correlationManager: {
		getCorrelationId: jest.fn(),
		runWithCorrelationId: jest.fn((_id, callback) => callback()),
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

/**
 * Mocked {@link WinstonAdapter} for testing purposes.
 */
export const mockWinstonAdapter = {
	getPrefixedLogger: jest.fn().mockReturnValue(mockILogger),
} as unknown as WinstonAdapter;
