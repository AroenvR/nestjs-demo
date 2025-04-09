import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './UserController';
import { MockService } from '../../../__tests__/mocks/service/MockService';
import { UserService } from '../../../application/services/user/UserService';
import { mockILogger } from '../../../__tests__/mocks/mockLogAdapter';
import { UserResponseDto } from '../../dtos/user/UserResponseDto';
import { GuardedController } from '../GuardedController';
import { WinstonAdapter } from '../../../infrastructure/logging/adapters/WinstonAdapter';
import { MockCreateUserDto, MockUpdateUserDto } from '../../../__tests__/mocks/dto/MockUserDto';
import { MockUserEntity } from '../../../__tests__/mocks/entity/MockUserEntity';

describe('UserController Unit', () => {
	let controller: GuardedController;

	const ID = 1;
	let mockedResponse: UserResponseDto;

	beforeEach(async () => {
		mockedResponse = UserResponseDto.create(MockUserEntity.get());

		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
			providers: [
				{
					provide: UserService,
					useValue: new MockService(() => mockedResponse),
				},
				{
					provide: WinstonAdapter,
					useValue: mockILogger,
				},
			],
		}).compile();

		controller = module.get<UserController>(UserController);
	});

	// --------------------------------------------------

	it('Should be defined', () => {
		expect(controller).toBeDefined();
	});

	// -------------------------------------------------- \\

	describe('CREATE', () => {
		it('Can create an entity', async () => {
			const dto = MockCreateUserDto.get();

			await expect(controller.create(dto)).resolves.toEqual(mockedResponse);
			expect(mockILogger.info).toHaveBeenCalledWith(`Creating a new entity`);
		});
	});

	// -------------------------------------------------- \\

	describe('FIND ALL', () => {
		it('Finds all entities', async () => {
			await expect(controller.findAll()).resolves.toEqual([mockedResponse]);
			expect(mockILogger.info).toHaveBeenCalledWith(`Finding all entities`);
		});
	});

	// -------------------------------------------------- \\

	describe('FIND ONE', () => {
		it('Finds an entity by id', async () => {
			await expect(controller.findOne(ID)).resolves.toEqual(mockedResponse);
			expect(mockILogger.info).toHaveBeenCalledWith(`Finding entity by id ${ID}`);
		});
	});

	// -------------------------------------------------- \\

	describe('UPDATE', () => {
		it('Updates an entity', async () => {
			const dto = MockUpdateUserDto.get();

			await expect(controller.update(ID, dto)).resolves.toEqual(mockedResponse);
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
