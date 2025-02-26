import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../../../http_api/dtos/user/CreateUserDto';
import { UpdateUserDto } from '../../../http_api/dtos/user/UpdateUserDto';
import { UserResponseDto } from '../../../http_api/dtos/user/UserResponseDto';
import { UserEntity } from '../../../domain/user/UserEntity';
import { UserService } from './UserService';
import { wasLogged } from '../../../__tests__/helpers/wasLogged';
import { AbstractService } from '../AbstractService';
import { createMockAppModule } from '../../../__tests__/mocks/module/createMockAppModule';
import { UserModule } from '../../../http_api/modules/user/UserModule';
import { MockCreateUserDto, MockUpdateUserDto } from '../../../__tests__/mocks/dto/MockUserDto';
import { MockUserEntity } from '../../../__tests__/mocks/entity/MockUserEntity';

// Value to change
describe('UserService Integration', () => {
	const testName = 'UserService_Integration'; // Value to change
	process.env.TEST_NAME = testName; // Creates a log file named with this test's name.

	let repository: Repository<unknown>;
	let service: AbstractService<CreateUserDto, UpdateUserDto, UserResponseDto>; // Values to change
	let className: string;

	let entity: UserEntity;
	let createDto: CreateUserDto;

	beforeAll(async () => {
		const module = await createMockAppModule(UserModule);

		repository = module.get(getRepositoryToken(UserEntity)); // Value to change
		service = module.get<UserService>(UserService); // Value to change
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

	// --------------------------------------------------

	it('Should be defined', () => {
		expect(service).toBeDefined();
	});

	// --------------------------------------------------

	it('Can create an entity', async () => {
		const response = await service.create(createDto);

		expect(response).toBeInstanceOf(UserResponseDto);
		expect(response.id).toEqual(entity.id + 1);

		expect(response.username).toEqual(createDto.username);
		expect(response.password).toEqual(createDto.password);

		await expect(wasLogged(testName, `${className}: Creating a new entity`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Finds all entities', async () => {
		const response = await service.findAll();

		const found = response.find((data) => data.id === entity.id);
		expect(found.id).toEqual(entity.id);
		expect(found.uuid).toEqual(entity.uuid);
		expect(found.createdAt).toEqual(entity.createdAt);

		expect(found.username).toEqual(entity.username);
		expect(found.password).toEqual(entity.password);

		await expect(wasLogged(testName, `${className}: Finding all entities`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Finds an entity by id', async () => {
		const response = await service.findOne(entity.id);

		expect(response).toBeInstanceOf(UserResponseDto);
		expect(response.id).toEqual(entity.id);
		expect(response.uuid).toEqual(entity.uuid);
		expect(response.createdAt).toEqual(entity.createdAt);

		expect(response.username).toEqual(entity.username);
		expect(response.password).toEqual(entity.password);

		await expect(wasLogged(testName, `${className}: Finding entity by id ${entity.id}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Throws when unable to find an entity by id', async () => {
		const id = 69;

		await expect(service.findOne(id)).rejects.toThrow(`Entity by id ${id} not found`);
		await expect(wasLogged(testName, `${className}: Finding entity by id ${id}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Updates an entity', async () => {
		const dto = MockUpdateUserDto.get();
		const response = await service.update(entity.id, dto);

		expect(response).toBeInstanceOf(UserResponseDto);
		expect(response.id).toEqual(entity.id);
		expect(response.uuid).toEqual(entity.uuid);
		expect(response.createdAt).toEqual(entity.createdAt);

		expect(response.username).toEqual(dto.username);
		expect(response.password).toEqual(dto.password);

		await expect(wasLogged(testName, `${className}: Updating entity by id ${entity.id}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Deletes an entity', async () => {
		await expect(service.remove(entity.id)).resolves.toBeUndefined();
		await expect(wasLogged(testName, `${className}: Deleting entity by id ${entity.id}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Can observe events', async () => {
		const observable = await service.observe();

		expect(observable).toBeDefined();
		expect(observable).toHaveProperty('subscribe');

		await expect(wasLogged(testName, `${className}: Observing events`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Can emit events', async () => {
		const events = service['events'];
		const spy = jest.spyOn(events, 'next');

		await service.emit(entity);

		expect(spy).toHaveBeenCalledWith({ data: UserResponseDto.create(entity) });
		await expect(wasLogged(testName, `${className}: Emitting entity by id: ${entity.id}`)).resolves.toBe(true);
	});
});
