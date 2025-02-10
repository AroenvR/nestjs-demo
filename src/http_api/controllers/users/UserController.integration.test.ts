import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserController } from './UserController';
import { CreateUserDto } from '../../dtos/user/CreateUserDto';
import { UserEntity } from '../../../domain/user/UserEntity';
import { UserResponseDto } from '../../dtos/user/UserResponseDto';
import { wasLogged } from '../../../__tests__/helpers/wasLogged';
import { UpdateUserDto } from '../../dtos/user/UpdateUserDto';
import { GuardedController } from '../GuardedController';
import { createMockAppModule } from '../../../__tests__/mocks/module/createMockAppModule';
import { UserModule } from '../../../http_api/modules/users/UserModule';
import { MockUserEntity } from '../../../__tests__/mocks/entity/MockUserEntity';
import { MockCreateUserDto, MockUpdateUserDto } from '../../../__tests__/mocks/dto/MockUserDto';

describe('UserController Integration', () => {
	const TEST_NAME = 'UserController_Integration'; // Value to change
	process.env.TEST_NAME = TEST_NAME; // Creates a log file named with this test's name.

	let className: string;
	let controller: GuardedController;
	let repository: Repository<unknown>;

	let entity: UserEntity; // Value to change
	let createDto: CreateUserDto; // Value to change
	let updateDto: UpdateUserDto; // Value to change

	beforeAll(async () => {
		const module = await createMockAppModule(UserModule);

		controller = module.get<UserController>(UserController); // Value to change
		repository = module.get(getRepositoryToken(UserEntity)); // Value to change

		className = controller.constructor.name;
	});

	beforeEach(async () => {
		createDto = MockCreateUserDto.get(); // Value to change
		updateDto = MockUpdateUserDto.get(); // Value to change

		const data = MockUserEntity.get(); // Value to change
		entity = await repository.save(data);
	});

	afterEach(async () => {
		await repository.clear();
	});

	// --------------------------------------------------

	it('Should be defined', () => {
		expect(controller).toBeDefined();
	});

	// -------------------------------------------------- \\

	describe('CREATE', () => {
		it('Can create an entity', async () => {
			const created = (await controller.create(createDto)) as UserResponseDto;

			expect(created.username).toEqual(createDto.username);
			expect(created.password).toEqual(createDto.password);

			await expect(wasLogged(TEST_NAME, `${className}: Creating a new entity`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('should fail with empty input', async () => {
			await expect(controller.create(null)).rejects.toThrow(`${className}: Create payload is empty.`);
		});
	});

	// -------------------------------------------------- \\

	describe('FIND ALL', () => {
		it('Finds all entities', async () => {
			await expect(controller.findAll()).resolves.toEqual([UserResponseDto.create(entity)]); // Value to change
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
			const response = UserResponseDto.create(entity); // Value to change

			await expect(controller.findOne(entity.id)).resolves.toEqual(response);
			await expect(wasLogged(TEST_NAME, `${className}: Finding entity by id ${entity.id}`)).resolves.toBe(true);
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
			const response = UserResponseDto.create(entity.update(updateDto)); // Value to change

			await expect(controller.update(entity.id, updateDto)).resolves.toEqual(response);
			await expect(wasLogged(TEST_NAME, `${className}: Updating entity by id ${entity.id}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('Fails to update a non-existent entity', async () => {
			const nonExistentId = 999;

			await expect(controller.update(nonExistentId, updateDto)).rejects.toThrow(`Entity by id ${nonExistentId} not found`);
			await expect(wasLogged(TEST_NAME, `${className}: Updating entity by id ${nonExistentId}`)).resolves.toBe(true);
		});
	});

	// -------------------------------------------------- \\

	describe('DELETE', () => {
		it('Deletes an entity', async () => {
			await expect(controller.remove(entity.id)).resolves.toBeUndefined();
			await expect(wasLogged(TEST_NAME, `${className}: Deleting entity by id ${entity.id}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('Fails to delete an non-existent entity', async () => {
			const nonExistentId = 999;

			await expect(controller.remove(nonExistentId)).rejects.toThrow(`Entity by id ${nonExistentId} not found`);
			await expect(wasLogged(TEST_NAME, `${className}: Deleting entity by id ${nonExistentId}`)).resolves.toBe(true);
		});
	});
});
