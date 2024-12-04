import { NewWinstonAdapter } from '../../infrastructure/logging/adapters/NewWinstonAdapter';
import { ILogger } from '../../infrastructure/logging/ILogger';
import { serverConfig } from '../../infrastructure/configuration/serverConfig';
import { CorrelationManager } from '../../infrastructure/logging/correlation/CorrelationManager';


/**
 * A mocked ILogger object.
 */
export const mockILogger: jest.Mocked<ILogger> = {
    verbose: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
    critical: jest.fn(),
    config: {} as any, // Mock necessary config
    correlationManager: {} as any, // Mock correlation manager
    getPrefixedLogger: jest.fn().mockReturnThis(),
} as any;

export const mockLogAdapter = new NewWinstonAdapter(serverConfig().logging, new CorrelationManager());
