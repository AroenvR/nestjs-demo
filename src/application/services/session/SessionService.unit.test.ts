import { EntityManager } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Test, TestingModule } from "@nestjs/testing";
import { SessionService } from "./SessionService";
import { SessionEntity } from "../../../domain/session/SessionEntity";
import { mockILogger } from "../../../__tests__/mocks/mockLogAdapter";
import { MockEntityManager } from "../../../__tests__/mocks/entity_manager/MockEntityManager";
import { MockRepository } from "../../../__tests__/mocks/repository/MockRepository";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";
import { MockCreateSessionDto } from "../../../__tests__/mocks/dto/MockSessionDto";
import { MockSessionEntity } from "../../../__tests__/mocks/entity/MockSessionEntity";
import { SessionResponseDto } from "../../../http_api/dtos/session/SessionResponseDto";
import { UserEntity } from "../../../domain/user/UserEntity";
import { MockUserEntity } from "../../../__tests__/mocks/entity/MockUserEntity";

describe("SessionService.Unit", () => {
	let mockedSession: SessionEntity;
	let mockedUser: UserEntity;
	let service: SessionService;

	beforeEach(async () => {
		mockedSession = MockSessionEntity.get();
		mockedUser = MockUserEntity.get();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SessionService,
				{
					provide: WinstonAdapter,
					useValue: mockILogger,
				},
				{
					provide: getRepositoryToken(SessionEntity),
					useValue: new MockRepository(() => mockedSession),
				},
				{
					provide: getRepositoryToken(UserEntity),
					useValue: new MockRepository(() => mockedUser),
				},
				{
					provide: EntityManager,
					useValue: new MockEntityManager<SessionEntity>(),
				},
			],
		}).compile();

		service = module.get<SessionService>(SessionService);
	});

	// --------------------------------------------------

	it("Should be defined", () => {
		expect(service).toBeDefined();
	});

	// --------------------------------------------------

	it("Can create an entity", async () => {
		const createDto = MockCreateSessionDto.get();

		const created = await service.create(createDto);
		expect(created).toBeInstanceOf(SessionResponseDto);

		expect(created.username).toEqual(mockedUser.username);

		expect(mockILogger.info).toHaveBeenCalledWith(`Creating a new entity`);
	});

	// --------------------------------------------------

	it("Can verify if a session exists for a user", async () => {
		const exists = await service.exists(mockedUser.uuid);
		expect(exists).toBe(true);

		expect(mockILogger.info).toHaveBeenCalledWith(`Checking for an existing session for user uuid ${mockedUser.uuid}`);
	});

	// --------------------------------------------------

	it("Refreshes a session when it already exists", async () => {
		const createDto = MockCreateSessionDto.get();
		await service.create(createDto);

		const userRepo = service["userRepo"];
		const sessionRepo = service["repository"];
		(userRepo.findOne as jest.Mock).mockImplementationOnce(() => Promise.resolve(mockedUser));
		(sessionRepo.findOne as jest.Mock).mockImplementationOnce(() => Promise.resolve(mockedSession));

		await service.create(createDto);

		expect(mockILogger.info).toHaveBeenCalledWith(`Session already exists for user uuid ${mockedUser.uuid}`);
		expect(mockILogger.info).toHaveBeenCalledWith(`Updating entity for user uuid ${mockedUser.uuid}`);
	});

	// --------------------------------------------------

	it("Throws when unable to find a user by uuid", async () => {
		const uuid = "167ad25f-0f91-4ac0-a9ed-99cef801ba9e";

		await expect(service.exists(uuid)).rejects.toThrow(`User by uuid ${uuid} not found`);
		expect(mockILogger.info).toHaveBeenCalledWith(`Checking for an existing session for user uuid ${uuid}`);
	});

	// --------------------------------------------------

	it("Throws when user exists but session does not", async () => {
		const userRepo = service["userRepo"];
		const sessionRepo = service["repository"];
		(userRepo.findOne as jest.Mock).mockImplementationOnce(() => Promise.resolve(mockedUser));
		(sessionRepo.findOne as jest.Mock).mockImplementationOnce(() => Promise.resolve(null));

		await expect(service.exists(mockedUser.uuid)).rejects.toThrow(`Session for user uuid ${mockedUser.uuid} not found`);
		expect(mockILogger.info).toHaveBeenCalledWith(`Checking for an existing session for user uuid ${mockedUser.uuid}`);
	});

	// --------------------------------------------------

	it("Can update a session's token", async () => {
		const refreshTokenSpy = jest.spyOn(SessionEntity.prototype, "refreshToken");

		let savedEntity: SessionEntity;
		const entityManagerMock = service["entityManager"];
		(entityManagerMock.save as jest.Mock).mockImplementationOnce((entity) => {
			savedEntity = entity;
			return Promise.resolve(entity);
		});

		const mockToken = "mocked token";
		jest.spyOn(SessionService.prototype, "fetchToken" as any).mockResolvedValue(mockToken);

		const updated = await service.update(mockedUser.uuid);

		expect(updated).toBeInstanceOf(SessionResponseDto);
		expect(updated.uuid).toEqual(mockedUser.uuid);
		expect(updated.createdAt).toEqual(mockedUser.createdAt);
		expect(updated.username).toEqual(mockedUser.username);

		expect(refreshTokenSpy).toHaveBeenCalledWith(mockToken);

		expect(savedEntity.token).toEqual(mockToken);
		expect(savedEntity.refreshes).toEqual(mockedSession.refreshes + 1);

		expect(mockILogger.info).toHaveBeenCalledWith(`Updating entity for user uuid ${mockedUser.uuid}`);

		refreshTokenSpy.mockRestore();
	});

	// --------------------------------------------------

	it("Can delete an entity", async () => {
		await expect(service.remove(mockedUser.uuid)).resolves.not.toThrow();

		expect(mockILogger.info).toHaveBeenCalledWith(`Deleting entity for user uuid ${mockedUser.uuid}`);
	});
});
