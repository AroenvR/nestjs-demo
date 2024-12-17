import { EntityManager } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Subject } from 'rxjs';
import { UserService } from './UserService';
import { UserEntity } from '../../../domain/entities/user/UserEntity';
import { CreateUserDto } from '../../../application/dtos/user/CreateUserDto';
import { mockILogger } from '../../../__tests__/mocks/mockLogAdapter';
import { UserResponseDto } from '../../../application/dtos/user/UserResponseDto';
import { MockEntityManager } from '../../../__tests__/mocks/entity_manager/MockEntityManager';
import { MockRepository } from '../../../__tests__/mocks/repository/MockRepository';
import { UpdateUserDto } from '../../../application/dtos/user/UpdateUserDto';
import { ISseMessage } from '../../../application/events/ISseMessage';
import { AbstractService } from '../AbstractService';
import { NewWinstonAdapter } from '../../../infrastructure/logging/adapters/NewWinstonAdapter';
import { randomUUID } from 'crypto';

describe('UserService Unit', () => {
	const ID = 1;
	const UUID = randomUUID();
	const CREATED_AT = Date.now();
	const USERNAME = 'test';

	let entity: UserEntity;
	let service: AbstractService<CreateUserDto, UpdateUserDto, UserResponseDto>;

	beforeEach(async () => {
		entity = new UserEntity({ id: ID, uuid: UUID, createdAt: CREATED_AT, username: USERNAME });

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{
					useValue: mockILogger,
					provide: NewWinstonAdapter,
				},
				{
					provide: getRepositoryToken(UserEntity),
					useValue: new MockRepository(() => entity),
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
		const dto = new CreateUserDto();
		dto.username = USERNAME;

		const created = await service.create(dto);
		expect(created).toBeInstanceOf(UserResponseDto);
		expect(created.id).toEqual(ID);
		expect(created.username).toEqual(USERNAME);

		expect(mockILogger.info).toHaveBeenCalledWith(`Creating a new entity`);
	});

	// --------------------------------------------------

	it('Finds all entities', async () => {
		const data = await service.findAll();

		expect(data).toContainEqual(entity);
		expect(data).toBeInstanceOf(Array);

		for (const item of data) {
			expect(item).toBeInstanceOf(UserResponseDto);
			expect(item.id).toBeTruthy();
			expect(item.username).toBeTruthy();
		}

		expect(mockILogger.info).toHaveBeenCalledWith(`Finding all entities`);
	});

	// --------------------------------------------------

	it('Finds an entity by id', async () => {
		const data = await service.findOne(ID);

		expect(data).toEqual(entity);
		expect(data).toBeInstanceOf(UserResponseDto);
		expect(data.id).toEqual(ID);
		expect(data.username).toEqual(USERNAME);

		expect(mockILogger.info).toHaveBeenCalledWith(`Finding entity by id ${ID}`);
	});

	// --------------------------------------------------

	it('Throws when unable to find an entity by id', async () => {
		const id = 69;

		await expect(service.findOne(id)).rejects.toThrow(`Entity by id ${id} not found`);
		expect(mockILogger.info).toHaveBeenCalledWith(`Finding entity by id ${id}`);
	});

	// --------------------------------------------------

	it('Can update an entity', async () => {
		const dto = new UpdateUserDto();
		dto.username = 'updated';

		const updated = await service.update(ID, dto);
		expect(updated).not.toEqual(entity);

		expect(updated).toBeInstanceOf(UserResponseDto);
		expect(updated.id).toEqual(ID);
		expect(updated.username).toEqual(dto.username);

		expect(mockILogger.info).toHaveBeenCalledWith(`Updating entity by id ${ID}`);
	});

	// --------------------------------------------------

	it('Can delete an entity', async () => {
		const data = await service.remove(ID);
		expect(data).toBeUndefined();

		expect(mockILogger.info).toHaveBeenCalledWith(`Deleting entity by id ${ID}`);
	});

	// --------------------------------------------------

	it('Can observe events', () => {
		const observable = service.observe();

		expect(observable).toBeDefined();
		expect(observable).toHaveProperty('subscribe');

		expect(mockILogger.info).toHaveBeenCalledWith(`Observing template events`);
	});

	// --------------------------------------------------

	it('Can emit an event', () => {
		const events = service['events'] as Subject<ISseMessage<UserResponseDto>>;
		const spy = jest.spyOn(events, 'next');

		const data = new UserEntity({ id: ID, uuid: UUID, createdAt: CREATED_AT, username: USERNAME });
		service.emit(data);

		expect(spy).toHaveBeenCalledWith({ data: UserResponseDto.fromEntity(data) });
		expect(mockILogger.info).toHaveBeenCalledWith(`Emitting entity by id: ${data.id}`);
	});
});
