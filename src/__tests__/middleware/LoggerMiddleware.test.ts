import { LoggerMiddleware } from '../../middleware/LoggerMiddleware';
import { Request, Response, NextFunction } from 'express';
import { LogAdapter } from '../../logging/LogAdapter';
import { Test, TestingModule } from '@nestjs/testing';

// I'm going to be honest, GPT-4-o1 wrote this test and it's giving 100% coverage so... Look at it when you can.
// Basically, I haven't looked at if this is correct at all yet.

describe('LoggerMiddleware', () => {
	let middleware: LoggerMiddleware;
	let logger: LogAdapter;

	beforeEach(async () => {
		const mockLogAdapter = {
			getLogger: jest.fn().mockReturnValue({
				correlationManager: {
					runWithCorrelationId: jest.fn((_, callback) => callback()),
				},
				info: jest.fn(),
				verbose: jest.fn(),
			}),
			info: jest.fn(),
			verbose: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [LoggerMiddleware, { provide: LogAdapter, useValue: mockLogAdapter }],
		}).compile();

		middleware = module.get<LoggerMiddleware>(LoggerMiddleware);
		logger = module.get<LogAdapter>(LogAdapter);
	});

	// --------------------------------------------------

	it('should log request and response details', () => {
		const req = {
			method: 'GET',
			originalUrl: '/test-url',
			headers: {},
			body: null,
			query: null,
			params: null,
		} as unknown as Request;

		const res = {
			on: jest.fn((event, callback) => {
				if (event === 'finish') {
					callback();
				}
			}),
			get: jest.fn().mockReturnValue('123'),
			statusCode: 200,
		} as unknown as Response;

		const next: NextFunction = jest.fn();

		// Spy on performance.now()
		const performanceNowSpy = jest.spyOn(performance, 'now');
		performanceNowSpy.mockReturnValueOnce(1000).mockReturnValueOnce(2000);

		middleware.use(req, res, next);

		// Assertions
		expect(logger.getLogger().correlationManager.runWithCorrelationId).toHaveBeenCalled();

		expect(logger.info).toHaveBeenCalledWith(`Request: GET /test-url`);
		expect(logger.verbose).toHaveBeenCalledWith(`Request Headers: {}`);

		expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));

		expect(logger.info).toHaveBeenCalledWith(`Response: GET /test-url - Status: 200 - Content-Length: 123 bytes - Time: 1000 milliseconds.`);

		expect(next).toHaveBeenCalled();

		// Clean up
		performanceNowSpy.mockRestore();
	});

	// --------------------------------------------------

	it('should use provided correlation ID from headers', () => {
		const correlationId = 'test-correlation-id';

		const req = {
			method: 'GET',
			originalUrl: '/test-url',
			headers: { 'x-correlation-id': correlationId },
			body: null,
			query: null,
			params: null,
		} as unknown as Request;

		const res = {
			on: jest.fn((event, callback) => {
				if (event === 'finish') {
					callback();
				}
			}),
			get: jest.fn().mockReturnValue('123'),
			statusCode: 200,
		} as unknown as Response;

		const next: NextFunction = jest.fn();

		middleware.use(req, res, next);

		expect(logger.getLogger().correlationManager.runWithCorrelationId).toHaveBeenCalledWith(correlationId, expect.any(Function));
	});

	// --------------------------------------------------

	it('should log request body, query, and params when they are truthy', () => {
		const req = {
			method: 'POST',
			originalUrl: '/test-url',
			headers: {},
			body: { key: 'value' },
			query: { search: 'test' },
			params: { id: '123' },
		} as unknown as Request;

		const res = {
			on: jest.fn(),
		} as unknown as Response;

		const next: NextFunction = jest.fn();

		middleware.use(req, res, next);

		expect(logger.verbose).toHaveBeenCalledWith(`Request Body: ${JSON.stringify(req.body)}`);
		expect(logger.verbose).toHaveBeenCalledWith(`Request Query: ${JSON.stringify(req.query)}`);
		expect(logger.verbose).toHaveBeenCalledWith(`Request Params: ${JSON.stringify(req.params)}`);
	});

	// --------------------------------------------------

	it('should not log request body, query, or params when they are falsy', () => {
		const req = {
			method: 'GET',
			originalUrl: '/test-url',
			headers: {},
			body: null,
			query: null,
			params: null,
		} as unknown as Request;

		const res = {
			on: jest.fn(),
		} as unknown as Response;

		const next: NextFunction = jest.fn();

		middleware.use(req, res, next);

		expect(logger.verbose).not.toHaveBeenCalledWith(expect.stringContaining('Request Body'));
		expect(logger.verbose).not.toHaveBeenCalledWith(expect.stringContaining('Request Query'));
		expect(logger.verbose).not.toHaveBeenCalledWith(expect.stringContaining('Request Params'));
	});
});
