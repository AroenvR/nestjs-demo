import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from 'rxjs';
import { CreateUserDto } from '../../../http_api/dtos/user/CreateUserDto';
import { UpdateUserDto } from '../../../http_api/dtos/user/UpdateUserDto';
import { UserResponseDto } from '../../../http_api/dtos/user/UserResponseDto';
import { serverConfig } from '../../../infrastructure/configuration/serverConfig';
import { LoggerModule } from '../../../infrastructure/logging/LoggerModule';
import { DatabaseModule } from '../../../infrastructure/database/DatabaseModule';
import { UserEntity } from '../../../domain/user/UserEntity';
import { UserService } from './UserService';
import { wasLogged } from '../../../__tests__/helpers/wasLogged';
import { AbstractService } from '../AbstractService';
import { ISseMessage } from '../../../application/events/ISseMessage';
import { randomUUID } from 'crypto';

// Value to change
describe('UserService Integration', () => {
	const testName = 'UserService_Integration'; // Value to change
	process.env.TEST_NAME = testName; // Creates a log file named with this test's name.

	const ID = 1;
	const UUID = randomUUID();
	const CREATED_AT = Date.now();
	const USERNAME = 'test';
	const PASSWORD = 'testpass';

	let service: AbstractService<CreateUserDto, UpdateUserDto, UserResponseDto>; // Values to change
	let className: string;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({
					isGlobal: true,
					load: [serverConfig],
				}),
				LoggerModule,
				DatabaseModule,
				TypeOrmModule.forFeature([UserEntity]), // Value to change
			],
			providers: [UserService], // Value to change
		}).compile();

		service = module.get<UserService>(UserService); // Value to change
		className = service.constructor.name;
	});

	// --------------------------------------------------

	it('Should be defined', () => {
		expect(service).toBeDefined();
	});

	// --------------------------------------------------

	it('Can create an entity', async () => {
		const dto = new CreateUserDto();
		dto.username = USERNAME;
		dto.password = PASSWORD;

		const response = await service.create(dto);

		expect(response).toBeInstanceOf(UserResponseDto);
		expect(response.id).toEqual(ID);
		expect(response.username).toEqual(USERNAME);
		expect(response.password).toEqual(PASSWORD);

		await expect(wasLogged(testName, `${className}: Creating a new entity`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Finds all entities', async () => {
		const response = await service.findAll();

		expect(response).toBeInstanceOf(Array);

		for (const entity of response) {
			expect(entity).toBeInstanceOf(UserResponseDto);
			expect(entity.id).toEqual(ID);
			expect(entity.username).toEqual(USERNAME);
			expect(entity.password).toEqual(PASSWORD);
		}

		await expect(wasLogged(testName, `${className}: Finding all entities`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Finds an entity by id', async () => {
		const response = await service.findOne(ID);

		expect(response).toBeInstanceOf(UserResponseDto);
		expect(response.id).toEqual(ID);
		expect(response.username).toEqual(USERNAME);
		expect(response.password).toEqual(PASSWORD);

		await expect(wasLogged(testName, `${className}: Finding entity by id ${ID}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Throws when unable to find an entity by id', async () => {
		const id = 69;

		await expect(service.findOne(id)).rejects.toThrow(`Entity by id ${id} not found`);
		await expect(wasLogged(testName, `${className}: Finding entity by id ${id}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Updates an entity', async () => {
		const dto = new UpdateUserDto();
		dto.username = 'updated';
		dto.password = 'updatedpass';

		const response = await service.update(ID, dto);

		expect(response).toBeInstanceOf(UserResponseDto);
		expect(response.id).toEqual(ID);
		expect(response.username).toEqual(dto.username);
		expect(response.password).toEqual(dto.password);

		await expect(wasLogged(testName, `${className}: Updating entity by id ${ID}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Deletes an entity', async () => {
		await expect(service.remove(ID)).resolves.toBeUndefined();
		await expect(wasLogged(testName, `${className}: Deleting entity by id ${ID}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Can observe events', async () => {
		const observable = await service.observe();

		expect(observable).toBeDefined();
		expect(observable).toHaveProperty('subscribe');

		await expect(wasLogged(testName, `${className}: Observing template events`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Can emit events', async () => {
		const events = service['events'] as Subject<ISseMessage<UserResponseDto>>;
		const spy = jest.spyOn(events, 'next');

		const data = new UserEntity({ id: ID, uuid: UUID, createdAt: CREATED_AT, username: USERNAME, password: PASSWORD });
		service.emit(data);

		expect(spy).toHaveBeenCalledWith({ data: UserResponseDto.fromEntity(data) });
		await expect(wasLogged(testName, `${className}: Emitting entity by id: ${ID}`)).resolves.toBe(true);
	});
});
