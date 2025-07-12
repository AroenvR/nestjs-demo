import { Repository } from "typeorm";
import { AbstractExternalApiAdapter } from "./AbstractExternalApiAdapter";
import { IServerConfig } from "../../infrastructure/configuration/IServerConfig";
import { mockILogger, mockWinstonAdapter } from "../../__tests__/mocks/mockLogAdapter";
import { MockConfigService } from "../../__tests__/mocks/service/MockConfigService";
import { IExternalConfig } from "../IExternalConfig";
import { RequestBuilder } from "../../common/utility/request_builder/RequestBuilder";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { createMockAppModule } from "../../__tests__/mocks/module/createMockAppModule";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserEntity } from "../../domain/user/UserEntity";
import { MockUserEntity } from "../../__tests__/mocks/entity/MockUserEntity";
import { MockCreateLoginDto } from "../../__tests__/mocks/dto/MockLoginDto";
import { HttpExceptionMessages } from "../../common/enums/HttpExceptionMessages";
import { wasLogged } from "../../__tests__/helpers/wasLogged";
import { MockCreateUserDto } from "../../__tests__/mocks/dto/MockUserDto";
import { randomUUID, UUID } from "crypto";
import { MockExternalEventConsumer } from "../../__tests__/mocks/external/MockExternalEventConsumer";
import { IExternalEventConsumer } from "../events/IExternalEventConsumer";
import { ConfigService } from "@nestjs/config";
import { ExternalEventConsumer } from "../events/ExternalEventConsumer";
import { IExternalEventConsumerFactory } from "../events/IExternalEventConsumerFactory";

/**
 * A Mock implementation of the {@link AbstractExternalApiAdapter} for testing purposes.
 */
class TestApiAdapter extends AbstractExternalApiAdapter {
	public externalConfigKey() {
		return "test_api";
	}
}

const TEST_NAME = "AbstractExternalApiAdapter.E2E";
describe(TEST_NAME, () => {
	process.env.TEST_NAME = TEST_NAME; // Creates a log file named with this test's name.

	const ENDPOINT = "/v1/user";

	let app: INestApplication;

	let userRepo: Repository<UserEntity>;
	let user: UserEntity;

	let adapter: TestApiAdapter;
	let requestBuilder: RequestBuilder;
	let configService: ConfigService<IServerConfig>;
	let eventConsumer: IExternalEventConsumer;
	let eventConsumerFactory: IExternalEventConsumerFactory;

	let config: IExternalConfig;

	beforeAll(async () => {
		app = await createMockAppModule(undefined, { listen: true });
		userRepo = app.get(getRepositoryToken(UserEntity));

		config = {
			key: "test_api",
			ssl: false,
			domain: "localhost",
			port: app.getHttpServer().address().port,
			events: [],
		};
	});

	beforeEach(async () => {
		user = await userRepo.save(MockUserEntity.get());

		requestBuilder = new RequestBuilder(mockWinstonAdapter);
		configService = new MockConfigService([config]);
		eventConsumer = new MockExternalEventConsumer(mockWinstonAdapter);
		eventConsumerFactory = () => eventConsumer;

		adapter = new TestApiAdapter(mockWinstonAdapter, requestBuilder, configService, eventConsumerFactory);
	});

	afterEach(async () => {
		eventConsumer.disconnect(); // TODO change
		await userRepo.clear();
	});

	afterAll(async () => {
		await app.close();
		await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for ports to release
	});

	// --------------------------------------------------

	it("Should be defined", () => {
		expect(adapter).toBeDefined();
	});

	// --------------------------------------------------

	describe("Authentication", () => {
		describe("User credentials based", () => {
			it("Can log in to an external server", async () => {
				const setAccessTokenSpy = jest.spyOn(adapter, "setAccessToken");

				await adapter.login("/v1/auth/login", MockCreateLoginDto.get());

				expect(setAccessTokenSpy).toHaveBeenCalledWith(expect.any(String));
				expect(mockILogger.log).toHaveBeenCalledWith(`Logging in to ${config.domain}`);

				// Assert the server also logged a login request.
				await new Promise((resolve) => setTimeout(resolve, 500)); // Wait I/O to complete
				await expect(wasLogged(TEST_NAME, `LoggerMiddleware: Request: POST /v1/auth/login`)).resolves.toBe(true);
			});

			// --------------------------------------------------

			it("Can logout of the external server", async () => {
				await adapter.login("/v1/auth/login", MockCreateLoginDto.get());

				const setAccessTokenSpy = jest.spyOn(adapter, "setAccessToken");
				await adapter.logout("/v1/auth/logout");

				expect(setAccessTokenSpy).toHaveBeenCalledWith(null);

				// Assert the server also logged a logout request.
				await new Promise((resolve) => setTimeout(resolve, 500)); // Wait I/O to complete
				await expect(wasLogged(TEST_NAME, `LoggerMiddleware: Request: DELETE /v1/auth/logout`)).resolves.toBe(true);
			});
		});
	});

	// --------------------------------------------------

	describe("CRUD methods", () => {
		beforeEach(async () => {
			await adapter.login("/v1/auth/login", MockCreateLoginDto.get());
		});

		describe("GET", () => {
			it("Can send an authenticated request", async () => {
				const response = await adapter.get(`${ENDPOINT}/${user.uuid}`);
				expect(response).toEqual({
					isDto: true,
					id: user.id,
					uuid: user.uuid,
					createdAt: user.createdAt,
					username: user.username,
				});
			});

			// --------------------------------------------------

			it("Can handle a NOT_FOUND response", async () => {
				const response = await adapter.get(``);

				expect(response).toEqual({ status: HttpStatus.NOT_FOUND, message: HttpExceptionMessages.NOT_FOUND });
				expect(() => adapter.throwIfUnsuccessful(response)).toThrow(
					`${adapter.name}: Received a(n) ${HttpExceptionMessages.NOT_FOUND.toUpperCase()} response`,
				);
			});

			// --------------------------------------------------

			it("Can handle an BAD_REQUEST response", async () => {
				const response = await adapter.get(`${ENDPOINT}/69`);

				expect(response).toEqual({ status: HttpStatus.BAD_REQUEST, message: HttpExceptionMessages.BAD_REQUEST });
				expect(() => adapter.throwIfUnsuccessful(response)).toThrow(
					`${adapter.name}: Received a(n) ${HttpExceptionMessages.BAD_REQUEST.toUpperCase()} response`,
				);
			});

			// --------------------------------------------------

			it("Can handle an UNAUTHORIZED response", async () => {
				adapter = new TestApiAdapter(mockWinstonAdapter, requestBuilder, configService, eventConsumerFactory);
				const response = await adapter.get(`${ENDPOINT}/${user.uuid}`);

				expect(response).toEqual({ status: HttpStatus.UNAUTHORIZED, message: HttpExceptionMessages.UNAUTHORIZED });
				expect(() => adapter.throwIfUnsuccessful(response)).toThrow(
					`${adapter.name}: Received a(n) ${HttpExceptionMessages.UNAUTHORIZED.toUpperCase()} response`,
				);
			});

			// --------------------------------------------------

			it("Will retry an UNAUTHORIZED response", async () => {
				const retryUnauthReqSpy = jest.spyOn(adapter as any, "retryUnauthorizedRequest");

				adapter.setAccessToken("unauthorized_token");

				const response = await adapter.get(`${ENDPOINT}/${user.uuid}`);
				expect(response).toEqual({
					isDto: true,
					id: user.id,
					uuid: user.uuid,
					createdAt: user.createdAt,
					username: user.username,
				});

				expect(retryUnauthReqSpy).toHaveBeenCalled();
				expect(mockILogger.debug).toHaveBeenCalledWith(`Got an ${HttpExceptionMessages.UNAUTHORIZED} response. Retrying request.`);
			});
		});

		// --------------------------------------------------

		describe("POST", () => {
			const newUser = MockCreateUserDto.get();

			it("Can send an authenticated request", async () => {
				const response = await adapter.post(ENDPOINT, newUser);
				expect(response).toEqual({
					isDto: true,
					id: expect.any(Number),
					uuid: expect.any(String),
					createdAt: expect.any(Number),
					username: newUser.username,
				});
			});

			// --------------------------------------------------

			it("Can handle a NOT_FOUND response", async () => {
				const response = await adapter.post(``, {});

				expect(response).toEqual({ status: HttpStatus.NOT_FOUND, message: HttpExceptionMessages.NOT_FOUND });
				expect(() => adapter.throwIfUnsuccessful(response)).toThrow(
					`${adapter.name}: Received a(n) ${HttpExceptionMessages.NOT_FOUND.toUpperCase()} response`,
				);
			});

			// --------------------------------------------------

			it("Can handle an BAD_REQUEST response", async () => {
				const response = await adapter.post(ENDPOINT, {});

				expect(response).toEqual({ status: HttpStatus.BAD_REQUEST, message: HttpExceptionMessages.BAD_REQUEST });
				expect(() => adapter.throwIfUnsuccessful(response)).toThrow(
					`${adapter.name}: Received a(n) ${HttpExceptionMessages.BAD_REQUEST.toUpperCase()} response`,
				);
			});

			// --------------------------------------------------

			it("Can handle an UNAUTHORIZED response", async () => {
				adapter = new TestApiAdapter(mockWinstonAdapter, requestBuilder, configService, eventConsumerFactory);
				const response = await adapter.post(ENDPOINT, newUser);

				expect(response).toEqual({ status: HttpStatus.UNAUTHORIZED, message: HttpExceptionMessages.UNAUTHORIZED });
				expect(() => adapter.throwIfUnsuccessful(response)).toThrow(
					`${adapter.name}: Received a(n) ${HttpExceptionMessages.UNAUTHORIZED.toUpperCase()} response`,
				);

				expect(response).toEqual({ status: HttpStatus.UNAUTHORIZED, message: HttpExceptionMessages.UNAUTHORIZED });
				expect(() => adapter.throwIfUnsuccessful(response)).toThrow(
					`${adapter.name}: Received a(n) ${HttpExceptionMessages.UNAUTHORIZED.toUpperCase()} response`,
				);
			});

			// --------------------------------------------------

			it("Will retry an UNAUTHORIZED response", async () => {
				const retryUnauthReqSpy = jest.spyOn(adapter as any, "retryUnauthorizedRequest");

				adapter.setAccessToken("unauthorized_token");

				const response = await adapter.post(ENDPOINT, newUser);
				expect(response).toEqual({
					isDto: true,
					id: expect.any(Number),
					uuid: expect.any(String),
					createdAt: expect.any(Number),
					username: newUser.username,
				});

				expect(retryUnauthReqSpy).toHaveBeenCalled();
				expect(mockILogger.debug).toHaveBeenCalledWith(`Got an ${HttpExceptionMessages.UNAUTHORIZED} response. Retrying request.`);
			});
		});

		// --------------------------------------------------

		describe("PATCH", () => {
			const userUpdates = MockCreateUserDto.get();

			it("Can send an authenticated request", async () => {
				const response = await adapter.patch(`${ENDPOINT}/${user.uuid}`, userUpdates);
				expect(response).toEqual({
					isDto: true,
					id: user.id,
					uuid: user.uuid,
					createdAt: user.createdAt,
					username: userUpdates.username,
				});
			});

			// --------------------------------------------------

			it("Can handle a NOT_FOUND response", async () => {
				const response = await adapter.patch(``, {});
				expect(response).toEqual({ status: HttpStatus.NOT_FOUND, message: HttpExceptionMessages.NOT_FOUND });
				expect(() => adapter.throwIfUnsuccessful(response)).toThrow(
					`${adapter.name}: Received a(n) ${HttpExceptionMessages.NOT_FOUND.toUpperCase()} response`,
				);
			});

			// --------------------------------------------------

			it("Can handle an BAD_REQUEST response", async () => {
				const response = await adapter.patch(`${ENDPOINT}/${user.uuid}`, {});
				expect(response).toEqual({ status: HttpStatus.BAD_REQUEST, message: HttpExceptionMessages.BAD_REQUEST });
				expect(() => adapter.throwIfUnsuccessful(response)).toThrow(
					`${adapter.name}: Received a(n) ${HttpExceptionMessages.BAD_REQUEST.toUpperCase()} response`,
				);
			});

			// --------------------------------------------------

			it("Can handle an UNAUTHORIZED response", async () => {
				adapter = new TestApiAdapter(mockWinstonAdapter, requestBuilder, configService, eventConsumerFactory);
				const response = await adapter.patch(`${ENDPOINT}/${user.uuid}`, userUpdates);
				expect(response).toEqual({ status: HttpStatus.UNAUTHORIZED, message: HttpExceptionMessages.UNAUTHORIZED });
				expect(() => adapter.throwIfUnsuccessful(response)).toThrow(
					`${adapter.name}: Received a(n) ${HttpExceptionMessages.UNAUTHORIZED.toUpperCase()} response`,
				);
			});

			// --------------------------------------------------

			it("Will retry an UNAUTHORIZED response", async () => {
				const retryUnauthReqSpy = jest.spyOn(adapter as any, "retryUnauthorizedRequest");

				adapter.setAccessToken("unauthorized_token");

				const response = await adapter.patch(`${ENDPOINT}/${user.uuid}`, userUpdates);
				expect(response).toEqual({
					isDto: true,
					id: user.id,
					uuid: user.uuid,
					createdAt: user.createdAt,
					username: userUpdates.username,
				});

				expect(retryUnauthReqSpy).toHaveBeenCalled();
				expect(mockILogger.debug).toHaveBeenCalledWith(`Got an ${HttpExceptionMessages.UNAUTHORIZED} response. Retrying request.`);
			});
		});

		// --------------------------------------------------

		describe("DELETE", () => {
			let uuid: UUID;

			beforeEach(async () => {
				// Create a new user we can delete, because if we delete ourselves we can no longer be authenticated.
				const newUser = MockCreateUserDto.get();
				newUser.username = randomUUID();

				const createResp = await adapter.post(ENDPOINT, newUser);

				// @ts-expect-error: TODO: createResp isn't typed, I need to add optional typing.
				uuid = createResp.uuid;
			});

			it("Can send an authenticated request", async () => {
				const response = await adapter.delete(`${ENDPOINT}/${uuid}`);
				expect(response).toEqual(null);
			});

			// --------------------------------------------------

			it("Can handle a NOT_FOUND response", async () => {
				const response = await adapter.delete(``);
				expect(response).toEqual({ status: HttpStatus.NOT_FOUND, message: HttpExceptionMessages.NOT_FOUND });
				expect(() => adapter.throwIfUnsuccessful(response)).toThrow(
					`${adapter.name}: Received a(n) ${HttpExceptionMessages.NOT_FOUND.toUpperCase()} response`,
				);
			});

			// --------------------------------------------------

			it("Can handle an BAD_REQUEST response", async () => {
				const response = await adapter.delete(`${ENDPOINT}/69`);
				expect(response).toEqual({ status: HttpStatus.BAD_REQUEST, message: HttpExceptionMessages.BAD_REQUEST });
				expect(() => adapter.throwIfUnsuccessful(response)).toThrow(
					`${adapter.name}: Received a(n) ${HttpExceptionMessages.BAD_REQUEST.toUpperCase()} response`,
				);
			});

			// --------------------------------------------------

			it("Can handle an UNAUTHORIZED response", async () => {
				adapter = new TestApiAdapter(mockWinstonAdapter, requestBuilder, configService, eventConsumerFactory);
				const response = await adapter.delete(`${ENDPOINT}/${uuid}`);
				expect(response).toEqual({ status: HttpStatus.UNAUTHORIZED, message: HttpExceptionMessages.UNAUTHORIZED });
				expect(() => adapter.throwIfUnsuccessful(response)).toThrow(
					`${adapter.name}: Received a(n) ${HttpExceptionMessages.UNAUTHORIZED.toUpperCase()} response`,
				);
			});

			// --------------------------------------------------

			it("Will retry an UNAUTHORIZED response", async () => {
				const retryUnauthReqSpy = jest.spyOn(adapter as any, "retryUnauthorizedRequest");

				adapter.setAccessToken("unauthorized_token");

				const response = await adapter.delete(`${ENDPOINT}/${uuid}`);
				expect(response).toEqual(null);

				expect(retryUnauthReqSpy).toHaveBeenCalled();
				expect(mockILogger.debug).toHaveBeenCalledWith(`Got an ${HttpExceptionMessages.UNAUTHORIZED} response. Retrying request.`);
			});
		});
	});

	// --------------------------------------------------

	describe("Server Sent Events streams", () => {
		beforeEach(() => {
			requestBuilder = new RequestBuilder(mockWinstonAdapter);
			configService = new MockConfigService([config]);
			eventConsumer = new ExternalEventConsumer(mockWinstonAdapter);

			const factory: IExternalEventConsumerFactory = () => eventConsumer;

			adapter = new TestApiAdapter(mockWinstonAdapter, requestBuilder, configService, factory);
		});

		afterEach(() => {
			eventConsumer.disconnect();
		});

		it("Subscribes to an unauthenticated SSE stream with correct callback and headers", async () => {
			const callback = jest.fn().mockResolvedValue(undefined);

			const eventsEndpoint = ENDPOINT + "/events";
			await adapter.subscribeToSSE(eventsEndpoint, callback);

			expect(mockILogger.info).toHaveBeenCalledWith(`Successfully connected to ${eventsEndpoint}`);
		});

		// --------------------------------------------------

		it("Subscribes to an authenticated SSE stream with correct callback and headers", async () => {
			const callback = jest.fn().mockResolvedValue(undefined);

			adapter.setAccessToken("access_token");

			const eventsEndpoint = ENDPOINT + "/events";
			await adapter.subscribeToSSE(eventsEndpoint, callback);

			expect(mockILogger.info).toHaveBeenCalledWith(`Successfully connected to ${eventsEndpoint}`);
		});

		// --------------------------------------------------

		it("Receives SSE events", async () => {
			const callback = jest.fn().mockResolvedValue(undefined);

			await adapter.login("/v1/auth/login", MockCreateLoginDto.get());

			const eventsEndpoint = ENDPOINT + "/events";
			await adapter.subscribeToSSE(eventsEndpoint, callback);

			const newUser = MockCreateUserDto.get();
			const response = await adapter.post(ENDPOINT, newUser);

			await adapter.logout("/v1/auth/logout");

			expect(callback).toHaveBeenLastCalledWith(response);
		});
	});

	// --------------------------------------------------

	describe("Websockets", () => {});

	// --------------------------------------------------

	describe("Data streams", () => {});

	// --------------------------------------------------

	it("Can send a GET request using SSL to the WWW", async () => {
		// https://jsonplaceholder.typicode.com/posts/1

		const externalConfig: IExternalConfig = {
			key: "test_api",
			ssl: true,
			domain: "jsonplaceholder.typicode.com",
			port: 443,
			events: [],
		};

		adapter = new TestApiAdapter(mockWinstonAdapter, requestBuilder, new MockConfigService([externalConfig]), eventConsumerFactory);

		const response = await adapter.get("/posts/1");

		expect(response).toMatchObject({
			userId: expect.any(Number),
			id: 1,
			title: expect.any(String),
			body: expect.any(String),
		});
	});
});
