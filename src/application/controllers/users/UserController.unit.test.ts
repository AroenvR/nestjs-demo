import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './UserController';
import { MockService } from '../../../__tests__/mocks/service/MockService';
import { UserService } from '../../../application/services/user/UserService';
import { mockILogger } from '../../../__tests__/mocks/mockLogAdapter';
import { CreateUserDto } from '../../../application/dtos/user/CreateUserDto';
import { UpdateUserDto } from '../../../application/dtos/user/UpdateUserDto';
import { UserResponseDto } from '../../../application/dtos/user/UserResponseDto';
import { UserEntity } from '../../../domain/entities/user/UserEntity';
import { GuardedController } from '../GuardedController';
import { NewWinstonAdapter } from '../../../infrastructure/logging/adapters/NewWinstonAdapter';

describe('UserController Unit', () => {
	let controller: GuardedController;

	let createDto: CreateUserDto; // Value to change
	let expectedResponse: UserResponseDto; // Value to change

	const ID = 1;
	const USERNAME = 'Bob';

	beforeEach(async () => {
		createDto = new CreateUserDto();
		createDto.username = USERNAME;

		expectedResponse = UserResponseDto.fromEntity(UserEntity.create({ id: ID, username: USERNAME }));

		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserController], // Value to change
			providers: [
				{
					provide: UserService, // Value to change
					useValue: new MockService(() => expectedResponse),
				},
				{
					provide: NewWinstonAdapter,
					useValue: mockILogger,
				},
			],
		}).compile();

		controller = module.get<UserController>(UserController); // Value to change
	});

	// --------------------------------------------------

	it('Should be defined', () => {
		expect(controller).toBeDefined();
	});

	// -------------------------------------------------- \\

	describe('CREATE', () => {
		it('Can create an entity', async () => {
			await expect(controller.create(createDto)).resolves.toEqual(expectedResponse);
			expect(mockILogger.info).toHaveBeenCalledWith(`Creating a new entity`);
		});

		// --------------------------------------------------
	});

	// -------------------------------------------------- \\

	describe('FIND ALL', () => {
		it('Finds all entities', async () => {
			await expect(controller.findAll()).resolves.toEqual([expectedResponse]);
			expect(mockILogger.info).toHaveBeenCalledWith(`Finding all entities`);
		});
	});

	// -------------------------------------------------- \\

	describe('FIND ONE', () => {
		it('Finds an entity by id', async () => {
			await expect(controller.findOne(ID)).resolves.toEqual(expectedResponse);
			expect(mockILogger.info).toHaveBeenCalledWith(`Finding entity by id ${ID}`);
		});
	});

	// -------------------------------------------------- \\

	describe('UPDATE', () => {
		it('Updates an entity', async () => {
			const dto = new UpdateUserDto(); // Value to change
			dto.username = 'tested'; // Value to change

			await expect(controller.update(ID, dto)).resolves.toEqual(expectedResponse);
			expect(mockILogger.info).toHaveBeenCalledWith(`Updating entity by id ${ID}`);
		});
	});

	// -------------------------------------------------- \\

	describe('DELETE', () => {
		it('Deletes an entity', async () => {
			await expect(controller.remove(ID)).resolves.toBeUndefined();
			expect(mockILogger.info).toHaveBeenCalledWith(`Deleting entity by id ${ID}`);
		});
	});
});
