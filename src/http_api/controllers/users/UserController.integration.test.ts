import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserController } from './UserController';
import { CreateUserDto } from '../../dtos/user/CreateUserDto';
import { serverConfig } from '../../../infrastructure/configuration/serverConfig';
import { LoggerModule } from '../../../infrastructure/logging/LoggerModule';
import { DatabaseModule } from '../../../infrastructure/database/DatabaseModule';
import { UserEntity } from '../../../domain/user/UserEntity';
import { UserService } from '../../../application/services/user/UserService';
import { UserResponseDto } from '../../dtos/user/UserResponseDto';
import { wasLogged } from '../../../__tests__/helpers/wasLogged';
import { UpdateUserDto } from '../../dtos/user/UpdateUserDto';
import { GuardedController } from '../GuardedController';

describe('UserController Integration', () => {
	const TEST_NAME = 'UserController_Integration'; // Value to change
	process.env.TEST_NAME = TEST_NAME; // Creates a log file named with this test's name.

	let className: string;
	let controller: GuardedController;
	let repository: Repository<unknown>;

	let createDto: CreateUserDto; // Value to change
	let existingEntity: UserEntity; // Value to change

	const USERNAME = 'Bob';
	const PASSWORD = 'BobsSecret';

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
			controllers: [UserController], // Value to change
			providers: [UserService], // Value to change
		}).compile();

		controller = module.get<UserController>(UserController); // Value to change
		repository = module.get(getRepositoryToken(UserEntity)); // Value to change

		className = controller.constructor.name;

		createDto = new CreateUserDto(); // Value to change
		createDto.username = USERNAME; // Value to change
		createDto.password = PASSWORD; // Value to change
	});

	beforeEach(async () => {
		const dto = new CreateUserDto(); // Value to change
		dto.username = 'Initial'; // Value to change
		dto.password = 'InitialPass'; // Value to change

		const entity = UserEntity.create(dto); // Value to change
		existingEntity = await repository.save(entity);
	});

	afterEach(async () => {
		await repository.query(`DELETE FROM user_entity`); // Value to change
		await repository.query(`DELETE FROM sqlite_sequence WHERE name='user_entity'`); // For SQLite & Value to change
	});

	// --------------------------------------------------

	it('Should be defined', () => {
		expect(controller).toBeDefined();
	});

	// -------------------------------------------------- \\

	describe('CREATE', () => {
		it('Can create an entity', async () => {
			const created = (await controller.create(createDto)) as UserResponseDto;
			expect(created.id).toEqual(2);
			expect(created.username).toEqual(createDto.username);
			expect(created.password).toEqual(createDto.password);

			await expect(wasLogged(TEST_NAME, `${className}: Creating a new entity`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('should fail with duplicate input', async () => {
			createDto.username = 'Initial'; // Value to change
			createDto.password = 'InitialPassie'; // Value to change
			await expect(controller.create(createDto)).rejects.toThrow('SQLITE_CONSTRAINT: UNIQUE constraint failed: user_entity.username'); // Value to change
		});

		// --------------------------------------------------

		it('should fail with empty input', async () => {
			await expect(controller.create(null)).rejects.toThrow(`${className}: Create payload is empty.`);
		});

		// --------------------------------------------------

		it('should fail with invalid data', async () => {
			const values: unknown[] = [null, undefined, '', 1, true, false, [], {}];
			for (const value of values) {
				// @ts-expect-error: Username expects a string.
				createDto.username = value;
				await expect(controller.create(createDto)).rejects.toThrow("UserEntity: Child's JSON schema validation failed"); // Value to change
			}

			for (const value of values) {
				// @ts-expect-error: Password expects a string.
				createDto.password = value;
				await expect(controller.create(createDto)).rejects.toThrow("UserEntity: Child's JSON schema validation failed"); // Value to change
			}
		});
	});

	// -------------------------------------------------- \\

	describe('FIND ALL', () => {
		it('Finds all entities', async () => {
			await expect(controller.findAll()).resolves.toEqual([UserResponseDto.fromEntity(existingEntity)]); // Value to change
			await expect(wasLogged(TEST_NAME, `${className}: Finding all entities`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('Returns empty array when no entities are found', async () => {
			await repository.clear();
			await expect(controller.findAll()).resolves.toEqual([]);
		});

		// --------------------------------------------------

		it('should handle errors gracefully', async () => {
			jest.spyOn(controller['service'], 'findAll').mockRejectedValue(new Error('Database error'));
			await expect(controller.findAll()).rejects.toThrow('Database error');
		});
	});

	// -------------------------------------------------- \\

	describe('FIND ONE', () => {
		it('Finds an entity by id', async () => {
			const response = UserResponseDto.fromEntity(existingEntity); // Value to change
			response.id = 1;

			await expect(controller.findOne(1)).resolves.toEqual(response);
			await expect(wasLogged(TEST_NAME, `${className}: Finding entity by id 1`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('Fails to find an entity with a non-existent id', async () => {
			const nonExistentId = 999;
			await expect(controller.findOne(nonExistentId)).rejects.toThrow(`Entity by id ${nonExistentId} not found`);
			await expect(wasLogged(TEST_NAME, `${className}: Finding entity by id ${nonExistentId}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('should handle errors gracefully', async () => {
			jest.spyOn(controller['service'], 'findOne').mockRejectedValue(new Error('Database error'));
			await expect(controller.findOne(1)).rejects.toThrow('Database error');
		});
	});

	// -------------------------------------------------- \\

	describe('UPDATE', () => {
		it('Updates an entity', async () => {
			const dto = new UpdateUserDto(); // Value to change
			dto.username = 'Alice';
			dto.password = 'AlicesPassword';

			const response = UserResponseDto.fromEntity(existingEntity); // Value to change
			response.username = 'Alice';
			response.password = 'AlicesPassword';
			response.id = 1;

			await expect(controller.update(1, dto)).resolves.toEqual(response);
			await expect(wasLogged(TEST_NAME, `${className}: Updating entity by id 1`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('Fails to update a non-existent entity', async () => {
			const nonExistentId = 999;
			const dto = new UpdateUserDto();
			dto.username = 'new value';
			dto.password = 'Also a new value';

			await expect(controller.update(nonExistentId, dto)).rejects.toThrow(`Entity by id ${nonExistentId} not found`);
			await expect(wasLogged(TEST_NAME, `${className}: Updating entity by id ${nonExistentId}`)).resolves.toBe(true);
		});
	});

	// -------------------------------------------------- \\

	describe('DELETE', () => {
		it('Deletes an entity', async () => {
			await expect(controller.remove(1)).resolves.toBeUndefined();
			await expect(wasLogged(TEST_NAME, `${className}: Deleting entity by id 1`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('Fails to delete an non-existent entity', async () => {
			const nonExistentId = 999;
			await expect(controller.remove(nonExistentId)).rejects.toThrow(`Entity by id ${nonExistentId} not found`);
			await expect(wasLogged(TEST_NAME, `${className}: Deleting entity by id ${nonExistentId}`)).resolves.toBe(true);
		});
	});
});
