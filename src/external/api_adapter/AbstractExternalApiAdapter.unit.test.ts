import { fail } from "assert";
import { HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AbstractExternalApiAdapter } from "./AbstractExternalApiAdapter";
import { IServerConfig } from "../../infrastructure/configuration/IServerConfig";
import { mockILogger, mockWinstonAdapter } from "../../__tests__/mocks/mockLogAdapter";
import { MockConfigService } from "../../__tests__/mocks/service/MockConfigService";
import { IExternalConfig } from "../IExternalConfig";
import { mockAndSpyFetchRequest, mapFetchRequestResponse } from "../../__tests__/helpers/mockAndSpyFetchRequest";
import { RequestBuilder, TRequestBuilderMethods } from "../../common/utility/request_builder/RequestBuilder";
import { MockCreateLoginDto } from "../../__tests__/mocks/dto/MockLoginDto";
import { IExternalEventConsumer } from "../events/IExternalEventConsumer";
import { MockExternalEventConsumer } from "../../__tests__/mocks/external/MockExternalEventConsumer";
import { IPrefixedLogger } from "../../infrastructure/logging/ILogger";
import { HttpExceptionMessages } from "../../common/enums/HttpExceptionMessages";
import { IExternalEventConsumerFactory } from "../events/IExternalEventConsumerFactory";

/**
 * A Mock implementation of the {@link AbstractExternalApiAdapter} for testing purposes.
 */
class TestApiAdapter extends AbstractExternalApiAdapter {
	public externalConfigKey() {
		return "test_api";
	}
}

describe("AbstractExternalApiAdapter.Unit", () => {
	let adapter: TestApiAdapter;
	let requestBuilder: RequestBuilder;
	let configService: ConfigService<IServerConfig>;
	let eventConsumer: IExternalEventConsumer;
	let eventConsumerFactory: IExternalEventConsumerFactory;
	let logger: jest.Mocked<IPrefixedLogger>;

	const CONFIG: IExternalConfig = {
		key: "test_api",
		ssl: false,
		domain: "foo.be",
		port: 69,
	};

	const MOCK_RESPONSE = {
		yolo: true,
	};

	const ENDPOINT = "/v1/testing";

	beforeEach(() => {
		logger = mockILogger;

		requestBuilder = new RequestBuilder(mockWinstonAdapter);
		configService = new MockConfigService([CONFIG]);
		eventConsumer = new MockExternalEventConsumer(mockWinstonAdapter);
		eventConsumerFactory = () => eventConsumer;

		adapter = new TestApiAdapter(mockWinstonAdapter, requestBuilder, configService, eventConsumerFactory);

		mockAndSpyFetchRequest(MOCK_RESPONSE);

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

	afterEach(() => {
		eventConsumer.disconnect();

		jest.restoreAllMocks();
	});

	// --------------------------------------------------

	it("Should be defined", () => {
		expect(adapter).toBeDefined();
	});

	// --------------------------------------------------

	describe("Authorization management", () => {
		describe("Credentials based", () => {
			it("Can send a login request to another server and sets the response's access token", async () => {
				const mockToken = "access_token";

				mockAndSpyFetchRequest(mockToken);
				const setAccessTokenSpy = jest.spyOn(adapter, "setAccessToken");

				await adapter.login("/v1/auth/login", MockCreateLoginDto.get());

				expect(setAccessTokenSpy).toHaveBeenCalledWith(mockToken);
				expect(logger.log).toHaveBeenCalledWith(`Logging in to ${CONFIG.domain}`);
			});

			// --------------------------------------------------

			it("Sets the header Authorization: Bearer ${token} for CRUD requests if an access token exists", async () => {
				const token = "jwt";
				adapter.setAccessToken(token);

				await adapter.get(ENDPOINT);
				expect(requestBuilder.setHeaders).toHaveBeenCalledWith({ ...adapter.defaultRequestHeaders(), Authorization: `Bearer ${token}` });
			});

			// --------------------------------------------------

			it("Can log out of the other server", async () => {
				await adapter.login("/v1/auth/login", MockCreateLoginDto.get());

				const setAccessTokenSpy = jest.spyOn(adapter, "setAccessToken");
				await adapter.logout("/v1/auth/logout");

				expect(setAccessTokenSpy).toHaveBeenCalledWith(null);
				expect(logger.log).toHaveBeenCalledWith(`Logging out of ${CONFIG.domain}`);
			});

			// --------------------------------------------------

			it("Will reauthenticate and retry an UNAUTHORIZED response once when logged in to a server", async () => {
				// Simulate a login response
				const mockToken = "access_token";
				mockAndSpyFetchRequest(mockToken);

				const credentials = MockCreateLoginDto.get();
				await adapter.login("/v1/auth/login", credentials);

				/* Simulate an UNAUTHORIZED response, then a successful login's response, and lastly a generic success response */

				const unauthorizedResponse = mapFetchRequestResponse({
					ok: false,
					status: HttpStatus.UNAUTHORIZED,
					message: HttpExceptionMessages.UNAUTHORIZED,
				});
				const newTokenResponse = mapFetchRequestResponse("updated_access_token");
				const successResponse = mapFetchRequestResponse({ ok: true });

				jest.spyOn(global, "fetch")
					.mockResolvedValueOnce(unauthorizedResponse)
					.mockResolvedValueOnce(newTokenResponse)
					.mockResolvedValueOnce(successResponse);

				/* Execute the GET request which should attempt to re-authenticate */

				const response = await adapter.get(ENDPOINT);
				expect(() => adapter.throwIfUnsuccessful(response)).not.toThrow();

				expect(mockILogger.debug).toHaveBeenCalledWith(`Got an ${HttpExceptionMessages.UNAUTHORIZED} response. Retrying request.`);
				expect(mockILogger.info).toHaveBeenCalledWith(
					`Credentials were updated. Retrying GET request to Domain: ${CONFIG.domain} | Endpoint: ${ENDPOINT}`,
				);
			});
		});

		// --------------------------------------------------

		describe("RSA key based - JWKs & OIDC", () => {
			// TODO
		});
	});

	// --------------------------------------------------

	describe("CRUD methods", () => {
		describe("GET requests", () => {
			it("Can execute a GET request correctly", async () => {
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

				expect(logger.debug).toHaveBeenCalledWith(`Executing ${method} request to Domain: ${CONFIG.domain} | Endpoint: ${ENDPOINT}`);
			});

			// --------------------------------------------------

			it("Can handle known error responses", async () => {
				for (const [key, value] of requestBuilder.knownErrors.entries()) {
					const mockResponse = { status: key, message: value };
					mockAndSpyFetchRequest({ ok: false, ...mockResponse });

					const getResp = await adapter.get(ENDPOINT);
					expect(getResp).toEqual(mockResponse);
				}
			});
		});

		// --------------------------------------------------

		describe("POST requests", () => {
			it("Can execute a POST request correctly", async () => {
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

				expect(logger.debug).toHaveBeenCalledWith(`Executing ${method} request to Domain: ${CONFIG.domain} | Endpoint: ${ENDPOINT}`);
			});

			// --------------------------------------------------

			it("Can handle known error responses", async () => {
				for (const [key, value] of requestBuilder.knownErrors.entries()) {
					const mockResponse = { status: key, message: value };
					mockAndSpyFetchRequest({ ok: false, ...mockResponse });

					const payload = { key: "value" };
					const postResp = await adapter.post(ENDPOINT, payload);
					expect(postResp).toEqual(mockResponse);
				}
			});
		});

		// --------------------------------------------------

		describe("PATCH requests", () => {
			it("Can execute a PATCH request correctly", async () => {
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

				expect(logger.debug).toHaveBeenCalledWith(`Executing ${method} request to Domain: ${CONFIG.domain} | Endpoint: ${ENDPOINT}`);
			});

			// --------------------------------------------------

			it("Can handle known error responses", async () => {
				for (const [key, value] of requestBuilder.knownErrors.entries()) {
					const mockResponse = { status: key, message: value };
					mockAndSpyFetchRequest({ ok: false, ...mockResponse });

					const payload = { key: "value" };
					const patchResp = await adapter.patch(ENDPOINT, payload);
					expect(patchResp).toEqual(mockResponse);
				}
			});
		});

		// --------------------------------------------------

		describe("DELETE requests", () => {
			it("Can execute a DELETE request correctly", async () => {
				const mockResponse = { ok: true, status: HttpStatus.NO_CONTENT, message: "no_content" };
				mockAndSpyFetchRequest(mockResponse);

				const response = await adapter.delete(ENDPOINT);
				expect(response).toEqual(null);

				const method: TRequestBuilderMethods = "DELETE";

				expect(requestBuilder.setMethod).toHaveBeenCalledWith(method);
				expect(requestBuilder.setUseSsl).toHaveBeenCalledWith(CONFIG.ssl);
				expect(requestBuilder.setDomain).toHaveBeenCalledWith(CONFIG.domain);
				expect(requestBuilder.setPort).toHaveBeenCalledWith(CONFIG.port);
				expect(requestBuilder.setEndpoint).toHaveBeenCalledWith(ENDPOINT);
				expect(requestBuilder.setHeaders).toHaveBeenCalledWith(adapter.defaultRequestHeaders());
				expect(requestBuilder.setResponseType).toHaveBeenCalledWith("json");

				expect(logger.debug).toHaveBeenCalledWith(`Executing ${method} request to Domain: ${CONFIG.domain} | Endpoint: ${ENDPOINT}`);
			});

			// --------------------------------------------------

			it("Can handle known error responses", async () => {
				for (const [key, value] of requestBuilder.knownErrors.entries()) {
					const mockResponse = { status: key, message: value };
					mockAndSpyFetchRequest({ ok: false, ...mockResponse });

					const deleteResp = await adapter.delete(ENDPOINT);
					expect(deleteResp).toEqual(mockResponse);
				}
			});
		});
	});

	// --------------------------------------------------

	describe("Server Sent Events", () => {
		it("Subscribes to an unauthenticated SSE stream with correct callback and headers", async () => {
			const mockConnect = jest.spyOn(eventConsumer, "connect");
			const callback = jest.fn().mockResolvedValue(undefined);

			const testEndpoint = "/v1/events";
			const mockUrl = new URL(testEndpoint, adapter.getExternalApiUrl());

			await adapter.subscribeToSSE(testEndpoint, callback);

			expect(mockConnect).toHaveBeenCalledWith(mockUrl, callback, {
				Accept: "text/event-stream",
				"Cache-Control": "no-cache",
			});
		});

		// --------------------------------------------------

		it("Subscribes to an authenticated SSE stream with correct callback and headers", async () => {
			const mockConnect = jest.spyOn(eventConsumer, "connect");
			const callback = jest.fn().mockResolvedValue(undefined);

			const testEndpoint = "/v1/events";
			const mockUrl = new URL(testEndpoint, adapter.getExternalApiUrl());

			adapter.setAccessToken("mock-token");
			await adapter.subscribeToSSE(testEndpoint, callback);

			expect(mockConnect).toHaveBeenCalledWith(mockUrl, callback, {
				Accept: "text/event-stream",
				"Cache-Control": "no-cache",
				Authorization: expect.stringContaining("Bearer "),
			});
		});
	});

	// --------------------------------------------------

	describe("Errors", () => {
		it("Should throw when no configuration object is set", async () => {
			try {
				// Remember that the MockConfigService now gets "misc" because that's what was set in the TestApiAdapter object at the top.
				adapter = new TestApiAdapter(mockWinstonAdapter, requestBuilder, new MockConfigService([{}]), eventConsumerFactory);

				fail("Did not throw");
			} catch (error) {
				expect(error.message).toEqual(`${adapter.constructor.name}: Did not find a valid configuration.`);
			}
		});

		// --------------------------------------------------

		it("Should throw when an invalid configuration object is set", async () => {
			try {
				adapter = new TestApiAdapter(
					mockWinstonAdapter,
					requestBuilder,
					new MockConfigService([{ key: "test_api", badConfig: true }]),
					eventConsumerFactory,
				);

				fail("Did not throw");
			} catch (error) {
				expect(error.message).toEqual(
					`${adapter.constructor.name}: Configuration object did not fit the external configuration JSON schema: ValidationError: \"domain\" is required. \"badConfig\" is not allowed`,
				);
			}
		});
	});
});
