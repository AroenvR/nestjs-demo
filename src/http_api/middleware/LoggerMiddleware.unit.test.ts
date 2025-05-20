import { Request, Response, NextFunction } from "express";
import { NestMiddleware } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { LoggerMiddleware } from "./LoggerMiddleware";
import { mockILogger } from "../../__tests__/mocks/mockLogAdapter";
import { WinstonAdapter } from "../../infrastructure/logging/adapters/WinstonAdapter";

describe("LoggerMiddleware Unit", () => {
	let middleware: NestMiddleware;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				LoggerMiddleware,
				{
					useValue: mockILogger,
					provide: WinstonAdapter,
				},
			],
		}).compile();

		middleware = module.get<LoggerMiddleware>(LoggerMiddleware);
	});

	afterEach(() => {
		jest.clearAllTimers();
		jest.resetAllMocks();
		jest.restoreAllMocks();
		jest.clearAllMocks();
	});

	// --------------------------------------------------

	it("logs request and response cycles with a correlation ID", () => {
		const METHOD = "GET";
		const ENDPOINT = "/test";
		const STATUS = 200;
		const CONTENT_LENGTH = 123;
		const TIME_TAKEN = 1000;

		const req = {
			method: METHOD,
			originalUrl: ENDPOINT,
			headers: {},
		} as unknown as Request;

		const res = {
			on: jest.fn((event, callback) => {
				if (event === "finish") {
					callback(); // Simulate the finish event
				}
			}),
			get: jest.fn().mockReturnValue(CONTENT_LENGTH),
			statusCode: STATUS,
		} as unknown as Response;

		const next: NextFunction = jest.fn();

		// Mock runWithCorrelationId to execute the callback
		(mockILogger.correlationManager.runWithCorrelationId as jest.Mock).mockImplementation((id, callback) => {
			callback(); // Ensure the callback runs
		});

		// Spy on performance.now()
		const performanceNowSpy = jest.spyOn(performance, "now");
		performanceNowSpy.mockReturnValueOnce(TIME_TAKEN).mockReturnValueOnce(TIME_TAKEN * 2);

		middleware.use(req, res, next);

		expect(mockILogger.log).toHaveBeenCalledWith(`Request: ${METHOD} ${ENDPOINT}`);
		expect(mockILogger.log).toHaveBeenCalledWith(
			`Response: ${METHOD} ${ENDPOINT} - Status: ${STATUS} - Content-Length: ${CONTENT_LENGTH} bytes - Time: ${TIME_TAKEN} milliseconds.`,
		);

		expect(res.on).toHaveBeenCalledWith("finish", expect.any(Function));
		expect(next).toHaveBeenCalled();
	});

	// --------------------------------------------------

	it("uses provided correlation ID from request headers", () => {
		const req = {
			method: "GET",
			originalUrl: "/test",
			headers: { "x-correlation-id": "provided-correlation-id" },
		} as unknown as Request;

		const res = {
			on: jest.fn(),
		} as unknown as Response;

		const next: NextFunction = jest.fn();

		// Mock runWithCorrelationId to execute the callback
		(mockILogger.correlationManager.runWithCorrelationId as jest.Mock).mockImplementation((id, callback) => {
			callback(); // Ensure the callback runs
		});

		middleware.use(req, res, next);

		// Verify provided correlation ID is used
		expect(mockILogger.correlationManager.runWithCorrelationId).toHaveBeenCalledWith("provided-correlation-id", expect.any(Function));

		expect(next).toHaveBeenCalled();
	});

	// --------------------------------------------------

	it.only("logs request headers, body, query, and params when truthy", () => {
		const req = {
			method: "POST",
			originalUrl: "/test",
			headers: { "content-type": "application/json" },
			body: { key: "value" },
			query: { search: "queryValue" },
			params: { id: "123" },
		} as unknown as Request;

		const res = {
			on: jest.fn(),
		} as unknown as Response;

		const next: NextFunction = jest.fn();

		// Mock runWithCorrelationId to execute the callback
		(mockILogger.correlationManager.runWithCorrelationId as jest.Mock).mockImplementation((id, callback) => {
			callback(); // Ensure the callback runs
		});

		middleware.use(req, res, next);

		// Verify the logger logs all details
		expect(mockILogger.verbose).toHaveBeenCalledWith('Request Headers: {"content-type":"application/json"}');
		expect(mockILogger.verbose).toHaveBeenCalledWith('Request Body: {"key":"value"}');
		expect(mockILogger.verbose).toHaveBeenCalledWith('Request Query: {"search":"queryValue"}');

		expect(next).toHaveBeenCalled();
	});
});
