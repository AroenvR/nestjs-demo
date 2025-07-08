import { createMockAppModule } from "../../../__tests__/mocks/module/createMockAppModule";
import { RequestBuilder, IRequestBuilder, BuilderResponse } from "./RequestBuilder";
import { UtilityModule } from "../UtilityModule";
import { HttpExceptionMessages } from "../../../common/enums/HttpExceptionMessages";
import { fetchRequestSpy } from "../../../__tests__/helpers/fetchRequestSpy";

describe("RequestBuilder", () => {
	let requestBuilder: IRequestBuilder;

	beforeEach(async () => {
		const module = await createMockAppModule(UtilityModule);
		requestBuilder = module.get<IRequestBuilder>(RequestBuilder);

		fetchRequestSpy();
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	// --------------------------------------------------

	it("Should build the request with provided values", () => {
		const built = requestBuilder
			.setMethod("POST")
			.setUseSsl(true)
			.setPort(443)
			.setDomain("example.com")
			.setEndpoint("/api/test")
			.setBody({ key: "value" })
			.setHeaders({ "Content-Type": "application/json" })
			.setResponseType("json")
			.build();

		expect(built.method).toEqual("POST");
		expect(built.useSsl).toEqual(true);
		expect(built.port).toEqual(443);
		expect(built.domain).toEqual("example.com");
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
			.setDomain("example.com")
			.setEndpoint("/api/test")
			.setBody("test body")
			.setHeaders({ "Content-Type": "text/plain" })
			.setResponseType("json")
			.build();

		// Prepare a mock fetch response
		const mockJsonResponse = { yolo: true };
		fetchRequestSpy(mockJsonResponse);

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

	it("Should return text response when responseType is 'text'", async () => {
		const built = requestBuilder
			.setMethod("GET")
			.setUseSsl(false)
			.setDomain("example.com")
			.setEndpoint("/api/test")
			.setHeaders({ "Content-Type": "text/plain" })
			.setResponseType("text")
			.build();

		const mockTextResponse = "Success!";
		fetchRequestSpy(mockTextResponse);

		const response = await built.execute();
		expect(response).toEqual(mockTextResponse);
		expect(typeof response).toEqual("string");
	});

	// --------------------------------------------------

	it("Should return JSON response when responseType is 'json'", async () => {
		const built = requestBuilder
			.setMethod("POST")
			.setUseSsl(true)
			.setDomain("example.com")
			.setEndpoint("/api/test")
			.setBody({ key: "value" })
			.setHeaders({ "Content-Type": "application/json" })
			.setResponseType("json")
			.build();

		const mockJsonResponse = { success: true };
		fetchRequestSpy(mockJsonResponse);

		const response = await built.execute();
		expect(response).toEqual(mockJsonResponse);
		expect(typeof response).toEqual("object");
	});

	// --------------------------------------------------

	it("Should return arrayBuffer response when responseType is 'arrayBuffer'", async () => {
		const built = requestBuilder
			.setMethod("GET")
			.setUseSsl(false)
			.setDomain("example.com")
			.setEndpoint("/api/test")
			.setHeaders({ "Content-Type": "application/octet-stream" })
			.setResponseType("arrayBuffer")
			.build();

		const mockArrayBufferResponse = new ArrayBuffer(8);
		fetchRequestSpy(mockArrayBufferResponse);

		const response = await built.execute();
		expect(response).toEqual(mockArrayBufferResponse);
		expect(typeof response).toEqual("object");
	});

	// --------------------------------------------------

	it("Should handle unauthorized response", async () => {
		const built = requestBuilder
			.setMethod("GET")
			.setUseSsl(false)
			.setDomain("example.com")
			.setEndpoint("/api/test")
			.setHeaders({ "Content-Type": "application/json" })
			.setResponseType("json")
			.build();

		fetchRequestSpy({ ok: false, status: 401 });

		const response = await built.execute();
		expect(response).toEqual(HttpExceptionMessages.UNAUTHORIZED);
		expect(typeof response).toEqual("string");
	});

	// --------------------------------------------------

	describe("Errors", () => {
		it("Should throw an error if response type is unsupported", async () => {
			const built = requestBuilder
				.setMethod("GET")
				.setUseSsl(false)
				.setDomain("example.com")
				.setEndpoint("/api/test")
				.setHeaders({ "Content-Type": "application/json" })
				.setResponseType("yolo" as BuilderResponse)
				.build();

			fetchRequestSpy();

			await expect(built.execute()).rejects.toThrow();
		});

		// --------------------------------------------------

		it("Should throw an error for unsupported response type", async () => {
			const built = requestBuilder
				.setMethod("GET")
				.setUseSsl(false)
				.setDomain("example.com")
				.setEndpoint("/api/test")
				.setHeaders({ "Content-Type": "application/json" })
				.setResponseType("unsupportedType" as BuilderResponse)
				.build();

			fetchRequestSpy();

			await expect(built.execute()).rejects.toThrow("RequestBuilder: Response type unsupportedType not yet supported.");
		});

		// --------------------------------------------------

		it("Should throw an error for failed requests", async () => {
			const built = requestBuilder
				.setMethod("GET")
				.setUseSsl(false)
				.setDomain("example.com")
				.setEndpoint("/api/test")
				.setHeaders({ "Content-Type": "application/json" })
				.setResponseType("json")
				.build();

			const mockResponse = {
				ok: false,
				status: 500,
				statusText: "Internal Server Error",
			};
			fetchRequestSpy(mockResponse);

			await expect(built.execute()).rejects.toThrow(
				"RequestBuilder: GET request to http://example.com/api/test | Status: 500 | Message: Internal Server Error",
			);
		});
	});
});
