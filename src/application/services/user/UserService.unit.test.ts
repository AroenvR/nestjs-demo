import { EntityManager } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./UserService";
import { UserEntity } from "../../../domain/user/UserEntity";
import { mockILogger } from "../../../__tests__/mocks/mockLogAdapter";
import { UserResponseDto } from "../../../http_api/dtos/user/UserResponseDto";
import { MockEntityManager } from "../../../__tests__/mocks/entity_manager/MockEntityManager";
import { MOCK_BAD_UUID, MockRepository } from "../../../__tests__/mocks/repository/MockRepository";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";
import { MockCreateUserDto, MockUpdateUserDto } from "../../../__tests__/mocks/dto/MockUserDto";
import { MockUserEntity } from "../../../__tests__/mocks/entity/MockUserEntity";
import { CacheManagerAdapter } from "../../../common/utility/cache/CacheManagerAdapter";
import { MockCacheManagerAdapter } from "../../../__tests__/mocks/service/MockCacheAdapter";

describe("UserService.Unit", () => {
	let mockedResponse: UserEntity;
	let service: UserService;

	beforeEach(async () => {
		mockedResponse = MockUserEntity.get();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{
					provide: WinstonAdapter,
					useValue: mockILogger,
				},
				{
					provide: getRepositoryToken(UserEntity),
					useValue: new MockRepository(() => mockedResponse),
				},
				{
					provide: EntityManager,
					useValue: new MockEntityManager<UserEntity>(),
				},
				{
					provide: CacheManagerAdapter,
					useValue: new MockCacheManagerAdapter(),
				},
			],
		}).compile();

		service = module.get(UserService);
	});

	// --------------------------------------------------

	it("Should be defined", () => {
		expect(service).toBeDefined();
	});

	// --------------------------------------------------

	it("Can create an entity", async () => {
		const createDto = MockCreateUserDto.get();

		const created = await service.create(createDto);
		expect(created).toBeInstanceOf(UserEntity);

		expect(created.username).toEqual(createDto.username);
		expect(created.password).toEqual(createDto.password);

		expect(mockILogger.info).toHaveBeenCalledWith(`Creating a new entity`);
	});

	// --------------------------------------------------

	it("Finds all entities", async () => {
		const entities = await service.findAll();

		const found = entities.find((data) => data.uuid === mockedResponse.uuid);
		if (!found) fail("Expected entity was not found.");

		expect(found).toBeInstanceOf(UserEntity);

		expect(found.id).toEqual(mockedResponse.id);
		expect(found.uuid).toEqual(mockedResponse.uuid);
		expect(found.createdAt).toEqual(mockedResponse.createdAt);

		expect(found.username).toEqual(mockedResponse.username);
		expect(found.password).toEqual(mockedResponse.password);

		expect(mockILogger.info).toHaveBeenCalledWith(`Finding all entities`);
	});

	// --------------------------------------------------

	it("Finds an entity by id", async () => {
		const data = await service.findOne(mockedResponse.uuid);

		expect(data).toEqual(mockedResponse);
		expect(data).toBeInstanceOf(UserEntity);

		expect(data.id).toEqual(mockedResponse.id);
		expect(data.uuid).toEqual(mockedResponse.uuid);
		expect(data.createdAt).toEqual(mockedResponse.createdAt);

		expect(data.username).toEqual(mockedResponse.username);
		expect(data.password).toEqual(mockedResponse.password);

		expect(mockILogger.info).toHaveBeenCalledWith(`Finding entity by uuid ${mockedResponse.uuid}`);
	});

	// --------------------------------------------------

	it("Throws when unable to find an entity by UUid", async () => {
		await expect(service.findOne(MOCK_BAD_UUID)).rejects.toThrow(`Entity by uuid ${MOCK_BAD_UUID} not found`);
		expect(mockILogger.info).toHaveBeenCalledWith(`Finding entity by uuid ${MOCK_BAD_UUID}`);
	});

	// --------------------------------------------------

	it("Can update an entity", async () => {
		const dto = MockUpdateUserDto.get();

		const updated = await service.update(mockedResponse.uuid, dto);
		expect(updated).not.toEqual(mockedResponse);

		expect(updated).toBeInstanceOf(UserEntity);
		expect(updated.uuid).toEqual(mockedResponse.uuid);
		expect(updated.createdAt).toEqual(mockedResponse.createdAt);

		expect(updated.username).toEqual(dto.username);
		expect(updated.password).toEqual(dto.password);

		expect(mockILogger.info).toHaveBeenCalledWith(`Updating entity by uuid ${mockedResponse.uuid}`);
	});

	// --------------------------------------------------

	it("Can delete an entity", async () => {
		await expect(service.remove(mockedResponse.uuid)).resolves.not.toThrow();

		expect(mockILogger.info).toHaveBeenCalledWith(`Deleting entity by uuid ${mockedResponse.uuid}`);
	});

	// --------------------------------------------------

	it("Can observe events", async () => {
		const observable = await service.observe();

		expect(observable).toBeDefined();
		expect(observable).toHaveProperty("subscribe");

		expect(mockILogger.info).toHaveBeenCalledWith(`Observing events`);
	});

	// --------------------------------------------------

	it("Can emit an event", async () => {
		const events = service["events"];
		const spy = jest.spyOn(events, "next");

		await service.emit(mockedResponse);

		expect(spy).toHaveBeenCalledWith({ data: UserResponseDto.create(mockedResponse) });
		expect(mockILogger.info).toHaveBeenCalledWith(`Emitting entity by uuid: ${mockedResponse.uuid}`);
	});
});
