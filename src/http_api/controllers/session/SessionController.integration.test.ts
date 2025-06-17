import { randomUUID } from "crypto";
import { Repository } from "typeorm";
import { INestApplication } from "@nestjs/common";
import { getRepositoryToken } from "@nestjs/typeorm";
import { SessionController } from "./SessionController";
import { SessionEntity } from "../../../domain/session/SessionEntity";
import { SessionResponseDto } from "../../dtos/session/SessionResponseDto";
import { wasLogged } from "../../../__tests__/helpers/wasLogged";
import { createMockAppModule } from "../../../__tests__/mocks/module/createMockAppModule";
import { SessionModule } from "../../modules/session/SessionModule";
import { MockSessionEntity } from "../../../__tests__/mocks/entity/MockSessionEntity";
import { MockUserEntity } from "../../../__tests__/mocks/entity/MockUserEntity";
import { UserEntity } from "../../../domain/user/UserEntity";
import { mockPlainTextJwt } from "../../../__tests__/mocks/mockJwt";

const TEST_NAME = "SessionController.Integration";
describe(TEST_NAME, () => {
	process.env.TEST_NAME = TEST_NAME; // Creates a log file named with this test's name.

	const MOCK_COOKIE = { user: mockPlainTextJwt };

	let app: INestApplication;

	let className: string;
	let controller: SessionController;
	let userRepo: Repository<UserEntity>;
	let repository: Repository<SessionEntity>;

	let user: UserEntity;

	let mockResponse: any;

	beforeAll(async () => {
		app = await createMockAppModule(SessionModule);

		controller = app.get<SessionController>(SessionController);
		userRepo = app.get(getRepositoryToken(UserEntity));
		repository = app.get(getRepositoryToken(SessionEntity));

		className = controller.constructor.name;
	});

	beforeEach(async () => {
		user = await userRepo.save(MockUserEntity.get());

		const data = MockSessionEntity.get();
		data.userUuid = user.uuid;

		mockResponse = {
			cookie: jest.fn(),
			clearCookie: jest.fn(),
		} as unknown as Response;
	});

	afterEach(async () => {
		await repository.clear();
		await userRepo.clear();
	});

	afterAll(async () => {
		await app.close();
	});

	// --------------------------------------------------

	it("Should be defined", () => {
		expect(controller).toBeDefined();
	});

	// -------------------------------------------------- \\

	describe("CREATE", () => {
		it("Can create an entity", async () => {
			const created = (await controller.login(user, mockResponse)) as SessionResponseDto;
			expect(created.username).toEqual(user.username);

			await expect(wasLogged(TEST_NAME, `${className}: Logging a user in`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it("should fail with empty input", async () => {
			// @ts-expect-error: Null isn't a valid parameter
			await expect(controller.login(null)).rejects.toThrow(`${className}: Create payload is empty.`);
		});
	});

	// -------------------------------------------------- \\

	describe("UPDATE", () => {
		it("Updates an entity", async () => {
			await controller.login(user, mockResponse);
			const response = SessionResponseDto.create(user);

			await expect(controller.update(user.uuid, MOCK_COOKIE, mockResponse)).resolves.toEqual(response);
			await expect(wasLogged(TEST_NAME, `${className}: Updating session and JWT for user uuid ${response.uuid}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it("Fails to update a non-existent entity", async () => {
			const nonExistentId = randomUUID();

			await expect(controller.update(nonExistentId, MOCK_COOKIE, mockResponse)).rejects.toThrow(`User by uuid ${nonExistentId} not found`);
			await expect(wasLogged(TEST_NAME, `${className}: Updating session and JWT for user uuid ${nonExistentId}`)).resolves.toBe(true);
		});
	});

	// -------------------------------------------------- \\

	describe("DELETE", () => {
		it("Deletes an entity", async () => {
			await expect(controller.logout(MOCK_COOKIE, mockResponse)).resolves.toBeUndefined();
			await expect(wasLogged(TEST_NAME, `${className}: Logging a user out`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it("Handles a logout request when no JWT is provided", async () => {
			await expect(controller.logout({}, mockResponse)).resolves.toBeUndefined();
			await expect(wasLogged(TEST_NAME, `${className}: Logging a user out`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `${className}: Missing JWT`)).resolves.toBe(true);
		});
	});
});
