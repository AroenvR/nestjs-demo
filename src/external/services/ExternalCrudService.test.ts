import { ExternalCrudService } from "./ExternalCrudService";
import { RequestBuilder, TRequestBuilderResponse } from "../../common/utility/request_builder/RequestBuilder";
import { WinstonAdapter } from "../../infrastructure/logging/adapters/WinstonAdapter";
import { IExternalConfig } from "../IExternalConfig";

describe("ExternalCrudService", () => {
	let service: ExternalCrudService;
	let builderMock: jest.Mocked<RequestBuilder>;
	let logAdapterMock: Partial<WinstonAdapter>;
	let loggerMock: any;
	let buildReturn: any;
	const config: IExternalConfig = {
		key: "test",
		ssl: true,
		domain: "api.test",
		port: 1234,
		events: [],
	};

	beforeEach(() => {
		// create a fake RequestBuilder with chainable methods
		buildReturn = { foo: "bar" };
		builderMock = {
			setMethod: jest.fn().mockReturnThis(),
			setUseSsl: jest.fn().mockReturnThis(),
			setDomain: jest.fn().mockReturnThis(),
			setPort: jest.fn().mockReturnThis(),
			setEndpoint: jest.fn().mockReturnThis(),
			setHeaders: jest.fn().mockReturnThis(),
			setBody: jest.fn().mockReturnThis(),
			setResponseType: jest.fn().mockReturnThis(),
			build: jest.fn().mockReturnValue(buildReturn),
		} as unknown as jest.Mocked<RequestBuilder>;

		// fake logger with all methods
		loggerMock = {
			debug: jest.fn(),
			verbose: jest.fn(),
			info: jest.fn(),
			log: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
			critical: jest.fn(),
			correlationManager: { runWithCorrelationId: jest.fn((_, cb) => cb()) },
		};

		logAdapterMock = {
			getPrefixedLogger: jest.fn().mockReturnValue(loggerMock),
		};

		service = new ExternalCrudService(logAdapterMock as WinstonAdapter, builderMock);
	});

	describe("configuration & headers", () => {
		it("defaultRequestHeaders throws if config not set", () => {
			expect(() => service.defaultRequestHeaders()).toThrow("ExternalCrudService: Call setup first.");
		});

		it("defaultRequestHeaders returns Content-Type only after setConfig", () => {
			service.setConfig(config);
			expect(service.defaultRequestHeaders()).toEqual({
				"Content-Type": "application/json",
			});
		});

		it("defaultRequestHeaders includes Authorization after setAccessToken", () => {
			service.setConfig(config);
			service.setAccessToken("my-token");
			expect(service.defaultRequestHeaders()).toEqual({
				"Content-Type": "application/json",
				Authorization: "Bearer my-token",
			});
		});
	});

	describe("CRUD methods", () => {
		const endpoint = "/widgets";
		const customHeaders = { "X-Custom": "yes" };
		const payload = { a: 1 };
		const customResponse: TRequestBuilderResponse = "json";

		beforeEach(() => {
			service.setConfig(config);
			service.setAccessToken("tok");
			jest.clearAllMocks();
		});

		function assertCommonCalls(method: string) {
			expect(builderMock.setMethod).toHaveBeenCalledWith(method);
			expect(builderMock.setUseSsl).toHaveBeenCalledWith(config.ssl);
			expect(builderMock.setDomain).toHaveBeenCalledWith(config.domain);
			expect(builderMock.setPort).toHaveBeenCalledWith(config.port);
			expect(builderMock.setEndpoint).toHaveBeenCalledWith(endpoint);
		}

		it("get() uses defaults when no headers/responseType passed", () => {
			const result = service.get(endpoint);
			assertCommonCalls("GET");
			expect(builderMock.setHeaders).toHaveBeenCalledWith({
				"Content-Type": "application/json",
				Authorization: "Bearer tok",
			});
			expect(builderMock.setResponseType).toHaveBeenCalledWith("json");
			expect(builderMock.build).toHaveBeenCalled();
			expect(result).toBe(buildReturn);
		});

		it("get() accepts custom headers & responseType", () => {
			service.get(endpoint, customHeaders, customResponse);
			assertCommonCalls("GET");
			expect(builderMock.setHeaders).toHaveBeenCalledWith(customHeaders);
			expect(builderMock.setResponseType).toHaveBeenCalledWith(customResponse);
		});

		it("post() sets body and defaults", () => {
			const result = service.post(endpoint, payload);
			assertCommonCalls("POST");
			expect(builderMock.setBody).toHaveBeenCalledWith(payload);
			expect(builderMock.setHeaders).toHaveBeenCalledWith({
				"Content-Type": "application/json",
				Authorization: "Bearer tok",
			});
			expect(builderMock.setResponseType).toHaveBeenCalledWith("json");
			expect(result).toBe(buildReturn);
		});

		it("post() accepts custom headers & responseType", () => {
			service.post(endpoint, payload, customHeaders, customResponse);
			assertCommonCalls("POST");
			expect(builderMock.setBody).toHaveBeenCalledWith(payload);
			expect(builderMock.setHeaders).toHaveBeenCalledWith(customHeaders);
			expect(builderMock.setResponseType).toHaveBeenCalledWith(customResponse);
		});

		it("patch() sets body and defaults", () => {
			service.patch(endpoint, payload);
			assertCommonCalls("PATCH");
			expect(builderMock.setBody).toHaveBeenCalledWith(payload);
			expect(builderMock.setHeaders).toHaveBeenCalledWith({
				"Content-Type": "application/json",
				Authorization: "Bearer tok",
			});
			expect(builderMock.setResponseType).toHaveBeenCalledWith("json");
		});

		it("delete() uses defaults when no headers/responseType passed", () => {
			service.delete(endpoint);
			assertCommonCalls("DELETE");
			expect(builderMock.setHeaders).toHaveBeenCalledWith({
				"Content-Type": "application/json",
				Authorization: "Bearer tok",
			});
			expect(builderMock.setResponseType).toHaveBeenCalledWith("json");
		});

		it("delete() accepts custom headers & responseType", () => {
			service.delete(endpoint, customHeaders, customResponse);
			assertCommonCalls("DELETE");
			expect(builderMock.setHeaders).toHaveBeenCalledWith(customHeaders);
			expect(builderMock.setResponseType).toHaveBeenCalledWith(customResponse);
		});
	});
});
