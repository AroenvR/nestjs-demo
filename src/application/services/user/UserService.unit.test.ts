import { EntityManager } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './UserService';
import { UserEntity } from '../../../domain/user/UserEntity';
import { CreateUserDto } from '../../../http_api/dtos/user/CreateUserDto';
import { mockILogger } from '../../../__tests__/mocks/mockLogAdapter';
import { UserResponseDto } from '../../../http_api/dtos/user/UserResponseDto';
import { MockEntityManager } from '../../../__tests__/mocks/entity_manager/MockEntityManager';
import { MockRepository } from '../../../__tests__/mocks/repository/MockRepository';
import { UpdateUserDto } from '../../../http_api/dtos/user/UpdateUserDto';
import { AbstractService } from '../AbstractService';
import { WinstonAdapter } from '../../../infrastructure/logging/adapters/WinstonAdapter';
import { MockCreateUserDto, MockUpdateUserDto } from '../../../__tests__/mocks/dto/MockUserDto';
import { MockUserEntity } from '../../../__tests__/mocks/entity/MockUserEntity';

describe('UserService Unit', () => {
	let mockedResponse: UserEntity;
	let service: AbstractService<CreateUserDto, UpdateUserDto, UserResponseDto>;

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
			],
		}).compile();

		service = module.get<UserService>(UserService);
	});

	// --------------------------------------------------

	it('Should be defined', () => {
		expect(service).toBeDefined();
	});

	// --------------------------------------------------

	it('Can create an entity', async () => {
		const createDto = MockCreateUserDto.get();

		const created = await service.create(createDto);
		expect(created).toBeInstanceOf(UserResponseDto);

		expect(created.username).toEqual(createDto.username);
		expect(created.password).toEqual(createDto.password);

		expect(mockILogger.info).toHaveBeenCalledWith(`Creating a new entity`);
	});

	// --------------------------------------------------

	it('Finds all entities', async () => {
		const entities = await service.findAll();

		const found = entities.find((data) => data.id === mockedResponse.id);
		if (!found) fail('Expected entity was not found.');

		expect(found).toBeInstanceOf(UserResponseDto);

		expect(found.id).toEqual(mockedResponse.id);
		expect(found.uuid).toEqual(mockedResponse.uuid);
		expect(found.createdAt).toEqual(mockedResponse.createdAt);

		expect(found.username).toEqual(mockedResponse.username);
		expect(found.password).toEqual(mockedResponse.password);

		expect(mockILogger.info).toHaveBeenCalledWith(`Finding all entities`);
	});

	// --------------------------------------------------

	it('Finds an entity by id', async () => {
		const data = await service.findOne(mockedResponse.id);

		expect(data).toEqual(mockedResponse);
		expect(data).toBeInstanceOf(UserResponseDto);

		expect(data.id).toEqual(mockedResponse.id);
		expect(data.uuid).toEqual(mockedResponse.uuid);
		expect(data.createdAt).toEqual(mockedResponse.createdAt);

		expect(data.username).toEqual(mockedResponse.username);
		expect(data.password).toEqual(mockedResponse.password);

		expect(mockILogger.info).toHaveBeenCalledWith(`Finding entity by id ${mockedResponse.id}`);
	});

	// --------------------------------------------------

	it('Throws when unable to find an entity by id', async () => {
		const id = 69;

		await expect(service.findOne(id)).rejects.toThrow(`Entity by id ${id} not found`);
		expect(mockILogger.info).toHaveBeenCalledWith(`Finding entity by id ${id}`);
	});

	// --------------------------------------------------

	it('Can update an entity', async () => {
		const dto = MockUpdateUserDto.get();

		const updated = await service.update(mockedResponse.id, dto);
		expect(updated).not.toEqual(mockedResponse);

		expect(updated).toBeInstanceOf(UserResponseDto);
		expect(updated.uuid).toEqual(mockedResponse.uuid);
		expect(updated.createdAt).toEqual(mockedResponse.createdAt);

		expect(updated.username).toEqual(dto.username);
		expect(updated.password).toEqual(dto.password);

		expect(mockILogger.info).toHaveBeenCalledWith(`Updating entity by id ${mockedResponse.id}`);
	});

	// --------------------------------------------------

	it('Can delete an entity', async () => {
		await expect(service.remove(mockedResponse.id)).resolves.not.toThrow();

		expect(mockILogger.info).toHaveBeenCalledWith(`Deleting entity by id ${mockedResponse.id}`);
	});

	// --------------------------------------------------

	it('Can observe events', async () => {
		const observable = await service.observe();

		expect(observable).toBeDefined();
		expect(observable).toHaveProperty('subscribe');

		expect(mockILogger.info).toHaveBeenCalledWith(`Observing template events`);
	});

	// --------------------------------------------------

	it('Can emit an event', async () => {
		const events = service['events'];
		const spy = jest.spyOn(events, 'next');

		await service.emit(mockedResponse);

		expect(spy).toHaveBeenCalledWith({ data: UserResponseDto.create(mockedResponse) });
		expect(mockILogger.info).toHaveBeenCalledWith(`Emitting entity by id: ${mockedResponse.id}`);
	});
});
