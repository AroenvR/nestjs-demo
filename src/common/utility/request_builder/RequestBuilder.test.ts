import { createMockAppModule } from "../../../__tests__/mocks/module/createMockAppModule";
import { RequestBuilder, IRequestBuilder, TRequestBuilderResponse, TRequestBuilderMethods } from "./RequestBuilder";
import { UtilityModule } from "../UtilityModule";
import { mockAndSpyFetchRequest } from "../../../__tests__/helpers/mockAndSpyFetchRequest";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { IPrefixedLogger } from "../../../infrastructure/logging/ILogger";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";
import { HttpExceptionMessages } from "../../../common/enums/HttpExceptionMessages";

function getHttpSuccessStatusCodes(): number[] {
	return [
		200, // OK
		201, // Created
		202, // Accepted
		203, // Non-Authoritative Information
		204, // No Content
		205, // Reset Content
		206, // Partial Content
		207, // Multi-Status (WebDAV)
		208, // Already Reported (WebDAV)
		226, // IM Used (HTTP Delta encoding)
	];
}

describe("RequestBuilder", () => {
	let app: INestApplication;

	let requestBuilder: IRequestBuilder;
	let logger: jest.Mocked<IPrefixedLogger>;

	const GET_MEHTOD: TRequestBuilderMethods = "GET";
	const DOMAIN = "example.com";

	beforeEach(async () => {
		app = await createMockAppModule(UtilityModule);
		requestBuilder = app.get<IRequestBuilder>(RequestBuilder);
		logger = app.get(WinstonAdapter);

		mockAndSpyFetchRequest();
	});

	afterEach(async () => {
		await app.close();

		jest.resetAllMocks();
	});

	// --------------------------------------------------

	it("Should build the request with provided values", () => {
		const built = requestBuilder
			.setMethod("POST")
			.setUseSsl(true)
			.setPort(443)
			.setDomain(DOMAIN)
			.setEndpoint("/api/test")
			.setBody({ key: "value" })
			.setHeaders({ "Content-Type": "application/json" })
			.setResponseType("json")
			.build();

		expect(built.method).toEqual("POST");
		expect(built.useSsl).toEqual(true);
		expect(built.port).toEqual(443);
		expect(built.domain).toEqual(DOMAIN);
		expect(built.endpoint).toEqual("/api/test");
		expect(built.body).toEqual({ key: "value" });
		expect(built.headers).toEqual({ "Content-Type": "application/json" });
		expect(built.responseType).toEqual("json");
	});

	// --------------------------------------------------

	it("Should execute the request and then reset builder state", async () => {
		const built = requestBuilder
			.setMethod("POST")
			.setUseSsl(true)
			.setPort(443)
			.setDomain(DOMAIN)
			.setEndpoint("/api/test")
			.setBody("test body")
			.setHeaders({ "Content-Type": "text/plain" })
			.setResponseType("json")
			.build();

		// Prepare a mock fetch response
		const mockJsonResponse = { yolo: true };
		mockAndSpyFetchRequest(mockJsonResponse);

		// Execute the request
		const response = await built.execute();
		expect(response).toEqual(mockJsonResponse);
		expect(typeof response).toEqual("object");

		// After execution, the builder should be reset to default values.
		expect(requestBuilder.method).toBe("GET");
		expect(requestBuilder.useSsl).toBe(false);
		expect(requestBuilder.port).toBeNull();
		expect(() => requestBuilder.domain).toThrow();
		expect(requestBuilder.endpoint).toBeNull();
		expect(requestBuilder.body).toBeNull();
		expect(requestBuilder.headers).toEqual({});
		expect(requestBuilder.responseType).toBe("json");
	});

	// --------------------------------------------------

	it("Logs when a request was successful", async () => {
		const method = "GET";
		const domain = "example.com";

		for (const code of getHttpSuccessStatusCodes()) {
			const loggerDebugSpy = jest.spyOn(logger, "debug");

			const built = requestBuilder
				.setMethod("GET")
				.setUseSsl(false)
				.setDomain("example.com")
				.setEndpoint("/api/test")
				.setHeaders({ "Content-Type": "application/json" })
				.setResponseType("text")
				.build();

			const mockResponse = { ok: true, status: code };
			mockAndSpyFetchRequest(mockResponse);

			await built.execute();

			expect(loggerDebugSpy).toHaveBeenCalledWith(
				requestBuilder.constructor.name,
				`Successful ${method} request to ${domain} | Status: ${code}`,
				undefined,
			);

			loggerDebugSpy.mockClear();
		}
	});

	// --------------------------------------------------

	describe("Response types", () => {
		describe("TEXT", () => {
			it("Should return a string", async () => {
				const built = requestBuilder
					.setMethod(GET_MEHTOD)
					.setUseSsl(false)
					.setDomain(DOMAIN)
					.setEndpoint("/api/test")
					.setHeaders({ "Content-Type": "text/plain" })
					.setResponseType("text")
					.build();

				const expectedText = "Success";

				jest.spyOn(global, "fetch").mockResolvedValueOnce(
					new Promise<Response>((resolve) => {
						resolve({
							ok: true,
							status: HttpStatus.OK,
							text: jest.fn().mockResolvedValue(expectedText),
						} as unknown as Response);
					}),
				);

				const response = await built.execute();
				expect(response).toEqual(expectedText);
				expect(typeof response).toEqual("string");
			});

			// --------------------------------------------------

			it("Should handle no content responses", async () => {
				const built = requestBuilder
					.setMethod(GET_MEHTOD)
					.setUseSsl(false)
					.setDomain(DOMAIN)
					.setEndpoint("/api/test")
					.setHeaders({ "Content-Type": "application/json" })
					.setResponseType("text")
					.build();

				const mockResponse = { ok: true, status: 204 };
				mockAndSpyFetchRequest(mockResponse);

				const response = await built.execute();
				expect(response).toEqual(null);
			});
		});

		// --------------------------------------------------

		describe("JSON", () => {
			it("Should return an object", async () => {
				const built = requestBuilder
					.setMethod(GET_MEHTOD)
					.setUseSsl(false)
					.setDomain(DOMAIN)
					.setEndpoint("/api/test")
					.setBody({ key: "value" })
					.setHeaders({ "Content-Type": "application/json" })
					.setResponseType("json")
					.build();

				const expectedObj = { success: true };
				jest.spyOn(global, "fetch").mockResolvedValueOnce(
					new Promise<Response>((resolve) => {
						resolve({
							ok: true,
							status: HttpStatus.OK,
							json: jest.fn().mockResolvedValue(expectedObj),
						} as unknown as Response);
					}),
				);

				const response = await built.execute();
				expect(response).toEqual(expectedObj);
				expect(typeof response).toEqual("object");
			});

			// --------------------------------------------------

			it("Should handle no content responses", async () => {
				const built = requestBuilder
					.setMethod(GET_MEHTOD)
					.setUseSsl(false)
					.setDomain(DOMAIN)
					.setEndpoint("/api/test")
					.setHeaders({ "Content-Type": "application/json" })
					.setResponseType("json")
					.build();

				const mockResponse = { ok: true, status: 204 };
				mockAndSpyFetchRequest(mockResponse);

				const response = await built.execute();
				expect(response).toEqual(null);
			});
		});

		// --------------------------------------------------

		describe("ARRAY_BUFFER", () => {
			it("Should return an ArrayBuffer", async () => {
				const built = requestBuilder
					.setMethod(GET_MEHTOD)
					.setUseSsl(false)
					.setDomain(DOMAIN)
					.setEndpoint("/api/test")
					.setHeaders({ "Content-Type": "application/octet-stream" })
					.setResponseType("arrayBuffer")
					.build();

				const expectedArrayBuffer = new ArrayBuffer(8);
				jest.spyOn(global, "fetch").mockResolvedValueOnce(
					new Promise<Response>((resolve) => {
						resolve({
							ok: true,
							status: HttpStatus.OK,
							arrayBuffer: jest.fn().mockResolvedValue(expectedArrayBuffer),
						} as unknown as Response);
					}),
				);

				const response = await built.execute();
				expect(response).toEqual(expectedArrayBuffer);
				expect(typeof response).toEqual("object");
			});
		});
	});

	// --------------------------------------------------

	describe("Errors", () => {
		it("Should throw an error if response type is unsupported", async () => {
			const built = requestBuilder
				.setMethod(GET_MEHTOD)
				.setUseSsl(false)
				.setDomain(DOMAIN)
				.setEndpoint("/api/test")
				.setHeaders({ "Content-Type": "application/json" })
				.setResponseType("yolo" as TRequestBuilderResponse)
				.build();

			mockAndSpyFetchRequest();

			await expect(built.execute()).rejects.toThrow('RequestBuilder: Response type "yolo" is not supported.');
		});

		// --------------------------------------------------

		it("Handles known error responses", async () => {
			for (const [status, message] of requestBuilder.knownErrors.entries()) {
				const loggerErrorSpy = jest.spyOn(logger, "error");

				const mockResponse = { ok: false, status: status };
				mockAndSpyFetchRequest(mockResponse);

				const response = await requestBuilder
					.setMethod(GET_MEHTOD)
					.setUseSsl(false)
					.setDomain(DOMAIN)
					.setEndpoint("/api/test")
					.setHeaders({ "Content-Type": "application/json" })
					.setResponseType("json")
					.build()
					.execute();

				expect(response).toEqual({
					status: status,
					message: message,
				});

				expect(loggerErrorSpy).toHaveBeenCalledWith(
					requestBuilder.constructor.name,
					`Failed ${GET_MEHTOD} request to ${DOMAIN} | Status: ${status} | Message: ${message}`,
					undefined,
				);
				loggerErrorSpy.mockClear();
			}
		});

		// --------------------------------------------------

		it("Handles unknown error responses", async () => {
			const loggerErrorSpy = jest.spyOn(logger, "error");

			const status = HttpStatus.PERMANENT_REDIRECT;
			const message = HttpExceptionMessages.UNKNOWN;

			const mockResponse = { ok: false, status: status };
			mockAndSpyFetchRequest(mockResponse);

			const response = await requestBuilder
				.setMethod(GET_MEHTOD)
				.setUseSsl(false)
				.setDomain(DOMAIN)
				.setEndpoint("/api/test")
				.setHeaders({ "Content-Type": "application/json" })
				.setResponseType("json")
				.build()
				.execute();

			expect(response).toEqual({
				status: status,
				message: message,
			});

			expect(loggerErrorSpy).toHaveBeenCalledWith(
				requestBuilder.constructor.name,
				`Failed ${GET_MEHTOD} request to ${DOMAIN} | Status: ${status} | Message: ${message}`,
				undefined,
			);
			loggerErrorSpy.mockClear();
		});
	});
});
