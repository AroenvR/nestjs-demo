import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateSessionDto } from "../../../http_api/dtos/session/CreateSessionDto";
import { SessionResponseDto } from "../../../http_api/dtos/session/SessionResponseDto";
import { SessionEntity } from "../../../domain/session/SessionEntity";
import { SessionService } from "./SessionService";
import { wasLogged } from "../../../__tests__/helpers/wasLogged";
import { createMockAppModule } from "../../../__tests__/mocks/module/createMockAppModule";
import { SessionModule } from "../../../http_api/modules/session/SessionModule";
import { MockCreateSessionDto } from "../../../__tests__/mocks/dto/MockSessionDto";
import { UserEntity } from "../../../domain/user/UserEntity";
import { MockUserEntity } from "../../../__tests__/mocks/entity/MockUserEntity";
import { randomUUID } from "crypto";

describe("SessionService Integration", () => {
	const testName = "SessionService_Integration";
	process.env.TEST_NAME = testName; // Creates a log file named with this test's name.

	let userRepo: Repository<UserEntity>;
	let repository: Repository<SessionEntity>;
	let service: SessionService;
	let className: string;

	let user: UserEntity;
	let createDto: CreateSessionDto;

	beforeAll(async () => {
		const module = await createMockAppModule(SessionModule);

		userRepo = module.get(getRepositoryToken(UserEntity));
		repository = module.get(getRepositoryToken(SessionEntity));
		service = module.get<SessionService>(SessionService);
		className = service.constructor.name;
	});

	beforeEach(async () => {
		createDto = MockCreateSessionDto.get();
		user = await userRepo.save(MockUserEntity.get());
	});

	afterEach(async () => {
		await repository.clear();
	});

	// --------------------------------------------------

	it("Should be defined", () => {
		expect(service).toBeDefined();
	});

	// --------------------------------------------------

	it("Can create an entity", async () => {
		const response = await service.create(createDto);

		expect(response).toBeInstanceOf(SessionResponseDto);
		expect(response.username).toEqual(user.username);

		await expect(wasLogged(testName, `${className}: Creating a new entity`)).resolves.toBe(true);

		const createdSession = await repository.findOne({
			where: { userUuid: user.uuid },
		});
		expect(createdSession).toBeDefined();
		expect(createdSession.token).toBeTruthy();
	});

	// --------------------------------------------------

	it("Can verify if a session exists for a user", async () => {
		await service.create(createDto);

		const exists = await service.exists(user.uuid);
		expect(exists).toEqual(true);

		await expect(wasLogged(testName, `${className}: Checking for an existing session for user uuid ${user.uuid}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it("Refreshes a session when it already exists", async () => {
		await service.create(createDto);

		const originalSession = await repository.findOne({ where: { userUuid: user.uuid } });
		expect(originalSession).toBeDefined();
		const originalToken = originalSession.token;

		await service.create(createDto);

		const refreshedSession = await repository.findOne({ where: { userUuid: user.uuid } });
		expect(refreshedSession).toBeDefined();
		expect(refreshedSession.token).not.toEqual(originalToken);

		await expect(wasLogged(testName, `${className}: Session already exists for user uuid ${user.uuid}`)).resolves.toBe(true);
		await expect(wasLogged(testName, `${className}: Updating entity for user uuid ${user.uuid}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it("Throws when unable to find a user by uuid", async () => {
		const uuid = randomUUID();

		await expect(service.exists(uuid)).rejects.toThrow(`User by uuid ${uuid} not found`);
		await expect(wasLogged(testName, `${className}: Checking for an existing session for user uuid ${uuid}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it("Throws when user exists but session does not", async () => {
		const uuid = randomUUID();

		// Create a real user but intentionally don't create a session
		await userRepo.save({
			...MockUserEntity.get(),
			uuid: uuid, // Override the UUID to match our test case
		});

		await expect(service.exists(uuid)).rejects.toThrow(`Session for user uuid ${uuid} not found`);
		await expect(wasLogged(testName, `${className}: Checking for an existing session for user uuid ${uuid}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it("Updates an entity", async () => {
		await service.create(createDto);
		const session = await repository.findOne({ where: { userUuid: user.uuid } });

		const response = await service.update(user.uuid);

		expect(response).toBeInstanceOf(SessionResponseDto);
		expect(response.username).toEqual(user.username);

		await expect(wasLogged(testName, `${className}: Updating entity for user uuid ${user.uuid}`)).resolves.toBe(true);

		const updated = await repository.findOne({ where: { userUuid: user.uuid } });
		expect(updated.token).not.toEqual(session.token);
		expect(updated.refreshes).toEqual(session.refreshes + 1);
	});

	// --------------------------------------------------

	it("Deletes an entity", async () => {
		const user = await service.create(createDto);

		await expect(service.remove(user.uuid)).resolves.toBeUndefined();
		await expect(wasLogged(testName, `${className}: Deleting entity for user uuid ${user.uuid}`)).resolves.toBe(true);
	});
});
