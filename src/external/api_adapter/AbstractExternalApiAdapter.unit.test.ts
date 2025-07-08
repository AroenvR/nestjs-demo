import { AbstractExternalApiAdapter } from "./AbstractExternalApiAdapter";
import { IServerConfig } from "../../infrastructure/configuration/IServerConfig";
import { mockILogger, mockWinstonAdapter } from "../../__tests__/mocks/mockLogAdapter";
import { MockConfigService } from "../../__tests__/mocks/service/MockConfigService";
import { IExternalConfig } from "../IExternalConfig";
import { mockAndSpyFetchRequest } from "../../__tests__/helpers/mockAndSpyFetchRequest";
import { IRequestBuilder, RequestBuilder, TRequestBuilderMethods } from "../../common/utility/request_builder/RequestBuilder";
import { MockCreateLoginDto } from "../../__tests__/mocks/dto/MockLoginDto";
import { HttpExceptionMessages } from "../../common/enums/HttpExceptionMessages";

/**
 * A Mock implementation of the {@link AbstractExternalApiAdapter} for testing purposes.
 */
class TestApiAdapter extends AbstractExternalApiAdapter {
	public configString(): keyof IServerConfig {
		// This is a wrong configuration getter on purpose
		// The config object is overwritten in most tests, but this way a faulty getter is also tested.

		// @ts-expect-error: Yolo
		return "externallApiConfig";
	}
}

describe("AbstractExternalApiAdapter", () => {
	let adapter: TestApiAdapter;
	let requestBuilder: IRequestBuilder;

	const CONFIG: IExternalConfig = {
		ssl: false,
		domain: "foo.be",
		port: 69,
		events: true,
	};

	const MOCK_RESPONSE = {
		yolo: true,
	};

	const ENDPOINT = "/v1/testing";

	beforeAll(() => {
		jest.spyOn(RequestBuilder.prototype, "setMethod");
		jest.spyOn(RequestBuilder.prototype, "setUseSsl");
		jest.spyOn(RequestBuilder.prototype, "setPort");
		jest.spyOn(RequestBuilder.prototype, "setDomain");
		jest.spyOn(RequestBuilder.prototype, "setEndpoint");
		jest.spyOn(RequestBuilder.prototype, "setBody");
		jest.spyOn(RequestBuilder.prototype, "setHeaders");
		jest.spyOn(RequestBuilder.prototype, "setResponseType");
		jest.spyOn(RequestBuilder.prototype, "build");
		jest.spyOn(RequestBuilder.prototype, "execute");
	});

	beforeEach(() => {
		requestBuilder = new RequestBuilder(mockWinstonAdapter);
		adapter = new TestApiAdapter(mockWinstonAdapter, requestBuilder, new MockConfigService(CONFIG));

		mockAndSpyFetchRequest(MOCK_RESPONSE);
	});

	// --------------------------------------------------

	it("Should be defined", () => {
		expect(adapter).toBeDefined();
	});

	// --------------------------------------------------

	it("Should execute a GET request correctly", async () => {
		const response = await adapter.get(ENDPOINT);

		expect(response).toEqual(MOCK_RESPONSE);
		expect(typeof response).toEqual("object");

		const method: TRequestBuilderMethods = "GET";

		expect(requestBuilder.setMethod).toHaveBeenCalledWith(method);
		expect(requestBuilder.setUseSsl).toHaveBeenCalledWith(CONFIG.ssl);
		expect(requestBuilder.setDomain).toHaveBeenCalledWith(CONFIG.domain);
		expect(requestBuilder.setPort).toHaveBeenCalledWith(CONFIG.port);
		expect(requestBuilder.setEndpoint).toHaveBeenCalledWith(ENDPOINT);
		expect(requestBuilder.setHeaders).toHaveBeenCalledWith(adapter.defaultRequestHeaders());
		expect(requestBuilder.setResponseType).toHaveBeenCalledWith("json");

		expect(mockILogger.debug).toHaveBeenCalledWith(`Executing ${method} request to Domain: ${CONFIG.domain} | Endpoint: ${ENDPOINT}`);
	});

	// --------------------------------------------------

	it("Should execute a POST request correctly", async () => {
		const payload = { key: "value" };
		const response = await adapter.post(ENDPOINT, payload);

		expect(response).toEqual(MOCK_RESPONSE);
		expect(typeof response).toEqual("object");

		const method: TRequestBuilderMethods = "POST";

		expect(requestBuilder.setMethod).toHaveBeenCalledWith(method);
		expect(requestBuilder.setUseSsl).toHaveBeenCalledWith(CONFIG.ssl);
		expect(requestBuilder.setDomain).toHaveBeenCalledWith(CONFIG.domain);
		expect(requestBuilder.setPort).toHaveBeenCalledWith(CONFIG.port);
		expect(requestBuilder.setEndpoint).toHaveBeenCalledWith(ENDPOINT);
		expect(requestBuilder.setHeaders).toHaveBeenCalledWith(adapter.defaultRequestHeaders());
		expect(requestBuilder.setResponseType).toHaveBeenCalledWith("json");

		expect(mockILogger.debug).toHaveBeenCalledWith(`Executing ${method} request to Domain: ${CONFIG.domain} | Endpoint: ${ENDPOINT}`);
	});

	// --------------------------------------------------

	it("Should execute a PATCH request correctly", async () => {
		const payload = { key: "value" };
		const response = await adapter.patch(ENDPOINT, payload);

		expect(response).toEqual(MOCK_RESPONSE);
		expect(typeof response).toEqual("object");

		const method: TRequestBuilderMethods = "PATCH";

		expect(requestBuilder.setMethod).toHaveBeenCalledWith(method);
		expect(requestBuilder.setUseSsl).toHaveBeenCalledWith(CONFIG.ssl);
		expect(requestBuilder.setDomain).toHaveBeenCalledWith(CONFIG.domain);
		expect(requestBuilder.setPort).toHaveBeenCalledWith(CONFIG.port);
		expect(requestBuilder.setEndpoint).toHaveBeenCalledWith(ENDPOINT);
		expect(requestBuilder.setHeaders).toHaveBeenCalledWith(adapter.defaultRequestHeaders());
		expect(requestBuilder.setResponseType).toHaveBeenCalledWith("json");

		expect(mockILogger.debug).toHaveBeenCalledWith(`Executing ${method} request to Domain: ${CONFIG.domain} | Endpoint: ${ENDPOINT}`);
	});

	// --------------------------------------------------

	it("Should execute a DELETE request correctly", async () => {
		const mockResponse = { ok: true, status: 204, statusText: "No Content" };
		mockAndSpyFetchRequest(mockResponse);

		const response = await adapter.delete(ENDPOINT);
		expect(response).toEqual(mockResponse);

		const method: TRequestBuilderMethods = "DELETE";

		expect(requestBuilder.setMethod).toHaveBeenCalledWith(method);
		expect(requestBuilder.setUseSsl).toHaveBeenCalledWith(CONFIG.ssl);
		expect(requestBuilder.setDomain).toHaveBeenCalledWith(CONFIG.domain);
		expect(requestBuilder.setPort).toHaveBeenCalledWith(CONFIG.port);
		expect(requestBuilder.setEndpoint).toHaveBeenCalledWith(ENDPOINT);
		expect(requestBuilder.setHeaders).toHaveBeenCalledWith(adapter.defaultRequestHeaders());
		expect(requestBuilder.setResponseType).toHaveBeenCalledWith("json");

		expect(mockILogger.debug).toHaveBeenCalledWith(`Executing ${method} request to Domain: ${CONFIG.domain} | Endpoint: ${ENDPOINT}`);
	});

	// --------------------------------------------------

	it("Sets the Authorization: Bearer header if an access token exists", async () => {
		const token = "jwt";
		adapter.setAccessToken(token);

		await adapter.get(ENDPOINT);
		expect(requestBuilder.setHeaders).toHaveBeenCalledWith({ ...adapter.defaultRequestHeaders(), Authorization: `Bearer ${token}` });
	});

	// --------------------------------------------------

	it("Can send a login request to another server", async () => {
		const mockToken = "access_token";
		mockAndSpyFetchRequest(mockToken);

		const setAccessTokenSpy = jest.spyOn(adapter, "setAccessToken");

		await adapter.login("/v1/auth/login", MockCreateLoginDto.get());
		expect(setAccessTokenSpy).toHaveBeenCalledWith(mockToken);

		expect(mockILogger.log).toHaveBeenCalledWith(`Logging in to ${CONFIG.domain}`);
	});

	// --------------------------------------------------

	it("Should handle an UNAUTHORIZED response without any credentials", async () => {
		const mockResponse = { ok: false, status: 401, statusText: "unauthorized" };
		mockAndSpyFetchRequest(mockResponse);

		const response = await adapter.get(ENDPOINT);
		expect(response).toEqual("unauthorized");

		expect(mockILogger.debug).toHaveBeenCalledWith(`Got a ${HttpExceptionMessages.UNAUTHORIZED} response. Retrying request.`);
		expect(mockILogger.warn).toHaveBeenCalledWith(`No credentials are set. Aborting retry request.`);
	});

	// --------------------------------------------------

	it("Should handle an UNAUTHORIZED response with credentials set", async () => {
		const mockToken = "access_token";
		mockAndSpyFetchRequest(mockToken);

		const credentials = MockCreateLoginDto.get();
		await adapter.login("/v1/auth/login", credentials);

		const mockResponse = { ok: false, status: 401, statusText: "unauthorized" };
		mockAndSpyFetchRequest(mockResponse);

		await adapter.get(ENDPOINT);
		expect(mockILogger.debug).toHaveBeenCalledWith(
			`Credentials were updated. Retrying GET request to Domain: ${CONFIG.domain} | Endpoint: ${ENDPOINT}`,
		);
	});

	// --------------------------------------------------

	describe("Errors", () => {
		it("Should throw when no configuration object is set", async () => {
			try {
				// Remember that the MockConfigService now gets "misc" because that's what was set in the TestApiAdapter object at the top.
				adapter = new TestApiAdapter(mockWinstonAdapter, requestBuilder, new MockConfigService());

				fail("Did not throw");
			} catch (error) {
				expect(error.message).toEqual(
					`${adapter.constructor.name}: Configuration object did not fit the external configuration JSON schema: Error: JSON schema: ValidationError: config is not an object`,
				);
			}
		});

		// --------------------------------------------------

		it("Should throw when an invalid configuration object is set", async () => {
			try {
				// Remember that the MockConfigService now gets "misc" because that's what was set in the TestApiAdapter object at the top.
				adapter = new TestApiAdapter(mockWinstonAdapter, requestBuilder, new MockConfigService({ badConfig: true }));

				fail("Did not throw");
			} catch (error) {
				expect(error.message).toEqual(
					`${adapter.constructor.name}: Configuration object did not fit the external configuration JSON schema: ValidationError: \"ssl\" is required. \"domain\" is required. \"port\" is required. \"events\" is required. \"badConfig\" is not allowed`,
				);
			}
		});
	});
});
