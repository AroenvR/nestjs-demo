import { Repository } from "typeorm";
import { AbstractExternalApiAdapter } from "./AbstractExternalApiAdapter";
import { IServerConfig } from "../../infrastructure/configuration/IServerConfig";
import { mockWinstonAdapter } from "../../__tests__/mocks/mockLogAdapter";
import { MockConfigService } from "../../__tests__/mocks/service/MockConfigService";
import { IExternalConfig } from "../IExternalConfig";
import { IRequestBuilder, RequestBuilder } from "../../common/utility/request_builder/RequestBuilder";
import { INestApplication } from "@nestjs/common";
import { createMockAppModule } from "../../__tests__/mocks/module/createMockAppModule";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserEntity } from "../../domain/user/UserEntity";
import { MockUserEntity } from "../../__tests__/mocks/entity/MockUserEntity";
import { MockCreateLoginDto } from "../../__tests__/mocks/dto/MockLoginDto";

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

const TEST_NAME = "AbstractExternalApiAdapter.Integration";
describe(TEST_NAME, () => {
	process.env.TEST_NAME = TEST_NAME; // Creates a log file named with this test's name.

	let app: INestApplication;
	let userRepo: Repository<UserEntity>;
	let user: UserEntity;

	let adapter: TestApiAdapter;
	let requestBuilder: IRequestBuilder;

	const PORT = 3005;
	const CONFIG: IExternalConfig = {
		ssl: false,
		domain: "localhost",
		port: PORT,
		events: false,
	};

	const ENDPOINT = "/v1/user";

	beforeAll(async () => {
		app = await createMockAppModule(undefined, PORT);
		userRepo = app.get(getRepositoryToken(UserEntity));
	});

	beforeEach(async () => {
		user = await userRepo.save(MockUserEntity.get());

		requestBuilder = new RequestBuilder(mockWinstonAdapter);
		adapter = new TestApiAdapter(mockWinstonAdapter, requestBuilder, new MockConfigService(CONFIG));
	});

	afterEach(async () => {
		await userRepo.clear();
	});

	afterAll(async () => {
		await app.close();
	});

	// --------------------------------------------------

	it("Should be defined", () => {
		expect(adapter).toBeDefined();
	});

	// --------------------------------------------------

	it("Can log in to an external server", async () => {
		await adapter.login("/v1/auth/login", MockCreateLoginDto.get());

		const response = await adapter.get(ENDPOINT);

		expect(Array.isArray(response)).toBe(true);
		expect(response[0]).toEqual({
			isDto: true,
			id: user.id,
			uuid: user.uuid,
			createdAt: user.createdAt,
			username: user.username,
		});
	});

	// --------------------------------------------------

	it("Can refresh its authentication token", async () => {
		await adapter.login("/v1/auth/login", MockCreateLoginDto.get());

		adapter.setAccessToken("unauthorized_token");
		const response = await adapter.get(ENDPOINT);

		expect(Array.isArray(response)).toBe(true);
		expect(response[0]).toEqual({
			isDto: true,
			id: user.id,
			uuid: user.uuid,
			createdAt: user.createdAt,
			username: user.username,
		});
	});

	// --------------------------------------------------

	it.skip("Can subscribe to, and receive, Server Sent Events", async () => {
		expect(true).toEqual(false);
	});
});
