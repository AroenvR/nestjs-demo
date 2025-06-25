import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserDto } from "../../../http_api/dtos/user/CreateUserDto";
import { UserResponseDto } from "../../../http_api/dtos/user/UserResponseDto";
import { UserEntity } from "../../../domain/user/UserEntity";
import { UserService } from "./UserService";
import { wasLogged } from "../../../__tests__/helpers/wasLogged";
import { createMockAppModule } from "../../../__tests__/mocks/module/createMockAppModule";
import { UserModule } from "../../../http_api/modules/user/UserModule";
import { MockCreateUserDto, MockUpdateUserDto } from "../../../__tests__/mocks/dto/MockUserDto";
import { MockUserEntity } from "../../../__tests__/mocks/entity/MockUserEntity";
import { MOCK_BAD_UUID } from "../../../__tests__/mocks/repository/MockRepository";
import { INestApplication } from "@nestjs/common";

const TEST_NAME = "UserService.Integration";
describe(TEST_NAME, () => {
	process.env.TEST_NAME = TEST_NAME; // Creates a log file named with this test's name.

	let app: INestApplication;

	let repository: Repository<UserEntity>;
	let service: UserService;
	let className: string;

	let entity: UserEntity;
	let createDto: CreateUserDto;

	beforeAll(async () => {
		app = await createMockAppModule(UserModule);

		repository = app.get(getRepositoryToken(UserEntity));
		service = app.get(UserService);
		className = service.constructor.name;
	});

	beforeEach(async () => {
		createDto = MockCreateUserDto.get();

		const data = MockUserEntity.get();
		entity = await repository.save(data);
	});

	afterEach(async () => {
		await repository.clear();
	});

	afterAll(async () => {
		await app.close();
	});

	// --------------------------------------------------

	it("Should be defined", () => {
		expect(service).toBeDefined();
	});

	// --------------------------------------------------

	it("Can create an entity", async () => {
		const response = await service.create(createDto);

		expect(response).toBeInstanceOf(UserEntity);
		expect(response.id).toEqual(entity.id + 1);

		expect(response.username).toEqual(createDto.username);
		expect(response.password).toEqual(createDto.password);

		await expect(wasLogged(TEST_NAME, `${className}: Creating a new entity`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it("Finds all entities", async () => {
		const response = await service.findAll();

		const found = response.find((data) => data.uuid === entity.uuid);
		expect(found.id).toEqual(entity.id);
		expect(found.uuid).toEqual(entity.uuid);
		expect(found.createdAt).toEqual(entity.createdAt);

		expect(found.username).toEqual(entity.username);
		expect(found.password).toEqual(entity.password);

		await expect(wasLogged(TEST_NAME, `${className}: Finding all entities`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it("Finds an entity by id", async () => {
		const response = await service.findOne(entity.uuid);

		expect(response).toBeInstanceOf(UserEntity);
		expect(response.id).toEqual(entity.id);
		expect(response.uuid).toEqual(entity.uuid);
		expect(response.createdAt).toEqual(entity.createdAt);

		expect(response.username).toEqual(entity.username);
		expect(response.password).toEqual(entity.password);

		await expect(wasLogged(TEST_NAME, `${className}: Finding entity by uuid ${entity.uuid}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it("Throws when unable to find an entity by id", async () => {
		await expect(service.findOne(MOCK_BAD_UUID)).rejects.toThrow(`Entity by uuid ${MOCK_BAD_UUID} not found`);
		await expect(wasLogged(TEST_NAME, `${className}: Finding entity by uuid ${MOCK_BAD_UUID}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it("Updates an entity", async () => {
		const dto = MockUpdateUserDto.get();
		const response = await service.update(entity.uuid, dto);

		expect(response).toBeInstanceOf(UserEntity);
		expect(response.id).toEqual(entity.id);
		expect(response.uuid).toEqual(entity.uuid);
		expect(response.createdAt).toEqual(entity.createdAt);

		expect(response.username).toEqual(dto.username);
		expect(response.password).toEqual(dto.password);

		await expect(wasLogged(TEST_NAME, `${className}: Updating entity by uuid ${entity.uuid}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it("Deletes an entity", async () => {
		await expect(service.remove(entity.uuid)).resolves.toBeUndefined();
		await expect(wasLogged(TEST_NAME, `${className}: Deleting entity by uuid ${entity.uuid}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it("Can observe events", async () => {
		const observable = await service.observe();

		expect(observable).toBeDefined();
		expect(observable).toHaveProperty("subscribe");

		await expect(wasLogged(TEST_NAME, `${className}: Observing events`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it("Can emit events", async () => {
		const events = service["events"];
		const spy = jest.spyOn(events, "next");

		await service.emit(entity);

		expect(spy).toHaveBeenCalledWith({ data: UserResponseDto.create(entity) });
		await expect(wasLogged(TEST_NAME, `${className}: Emitting entity by uuid: ${entity.uuid}`)).resolves.toBe(true);
	});
});
