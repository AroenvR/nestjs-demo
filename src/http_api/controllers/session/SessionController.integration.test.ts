import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SessionController } from './SessionController';
import { SessionEntity } from '../../../domain/session/SessionEntity';
import { SessionResponseDto } from '../../dtos/session/SessionResponseDto';
import { wasLogged } from '../../../__tests__/helpers/wasLogged';
import { createMockAppModule } from '../../../__tests__/mocks/module/createMockAppModule';
import { SessionModule } from '../../modules/session/SessionModule';
import { MockSessionEntity } from '../../../__tests__/mocks/entity/MockSessionEntity';
import { MockCreateSessionDto } from '../../../__tests__/mocks/dto/MockSessionDto';
import { MockUserEntity } from '../../../__tests__/mocks/entity/MockUserEntity';
import { UserEntity } from '../../../domain/user/UserEntity';
import { randomUUID } from 'crypto';

describe('SessionController Integration', () => {
	const TEST_NAME = 'SessionController_Integration';
	process.env.TEST_NAME = TEST_NAME; // Creates a log file named with this test's name.

	let className: string;
	let controller: SessionController;
	let userRepo: Repository<UserEntity>;
	let repository: Repository<SessionEntity>;

	let user: UserEntity;

	let mockRequest: any;
	let mockResponse: any;

	beforeAll(async () => {
		const module = await createMockAppModule(SessionModule);

		controller = module.get<SessionController>(SessionController);
		userRepo = module.get(getRepositoryToken(UserEntity));
		repository = module.get(getRepositoryToken(SessionEntity));

		className = controller.constructor.name;
	});

	beforeEach(async () => {
		user = await userRepo.save(MockUserEntity.get());

		const data = MockSessionEntity.get();
		data.userUuid = user.uuid;

		mockRequest = { user: { uuid: user.uuid } };
		mockResponse = {
			cookie: jest.fn(),
			clearCookie: jest.fn(),
		} as unknown as Response;
	});

	afterEach(async () => {
		await repository.clear();
		await userRepo.clear();
	});

	// --------------------------------------------------

	it('Should be defined', () => {
		expect(controller).toBeDefined();
	});

	// -------------------------------------------------- \\

	describe('CREATE', () => {
		it('Can create an entity', async () => {
			const created = (await controller.login(user, mockResponse)) as SessionResponseDto;
			expect(created.username).toEqual(user.username);

			await expect(wasLogged(TEST_NAME, `${className}: Logging a user in`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('should fail with empty input', async () => {
			// @ts-expect-error: Null isn't a valid parameter
			await expect(controller.login(null)).rejects.toThrow(`${className}: Create payload is empty.`);
		});
	});

	// -------------------------------------------------- \\

	describe('UPDATE', () => {
		it('Updates an entity', async () => {
			await controller.login(user, mockResponse);
			const response = SessionResponseDto.create(user);

			await expect(controller.update(user.uuid, mockRequest, mockResponse)).resolves.toEqual(response);
			await expect(wasLogged(TEST_NAME, `${className}: Updating session and JWT for uuid ${response.uuid}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('Fails to update a non-existent entity', async () => {
			const nonExistentId = randomUUID();

			await expect(controller.update(nonExistentId, mockRequest, mockResponse)).rejects.toThrow(`User by uuid ${nonExistentId} not found`);
			await expect(wasLogged(TEST_NAME, `${className}: Updating session and JWT for uuid ${nonExistentId}`)).resolves.toBe(true);
		});
	});

	// -------------------------------------------------- \\

	describe('DELETE', () => {
		it('Deletes an entity', async () => {
			await expect(controller.logout(mockRequest, mockResponse)).resolves.toBeUndefined();
			await expect(wasLogged(TEST_NAME, `${className}: Logging a user out`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('Handles a logout request when no JWT is provided', async () => {
			await expect(controller.logout({}, mockResponse)).resolves.toBeUndefined();
			await expect(wasLogged(TEST_NAME, `${className}: Logging a user out`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `${className}: Missing JWT`)).resolves.toBe(true);
		});
	});
});
