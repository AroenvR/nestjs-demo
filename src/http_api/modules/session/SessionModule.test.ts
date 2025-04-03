import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SessionModule } from './SessionModule';
import { CreateSessionDto } from '../../dtos/session/CreateSessionDto';
import { SessionEntity } from '../../../domain/session/SessionEntity';
import { wasLogged } from '../../../__tests__/helpers/wasLogged';
import { expiredJwt, mockJwt } from '../../../__tests__/mocks/mockJwt';
import { createMockAppModule } from '../../../__tests__/mocks/module/createMockAppModule';
import { MockCreateSessionDto, MockUpdateSessionDto } from '../../../__tests__/mocks/dto/MockSessionDto';
import { MockSessionEntity } from '../../../__tests__/mocks/entity/MockSessionEntity';
import { UserEntity } from '../../../domain/user/UserEntity';
import { MockUserEntity } from '../../../__tests__/mocks/entity/MockUserEntity';

const TEST_NAME = 'SessionModule';
describe(TEST_NAME, () => {
	process.env.TEST_NAME = TEST_NAME; // Creates a log file named with this test's name.

	const ENDPOINT = '/v1';

	let app: INestApplication;
	let repository: Repository<SessionEntity>;
	let userRepo: Repository<UserEntity>;

	let entity: SessionEntity;
	let user: UserEntity;

	let createDto: CreateSessionDto;

	beforeAll(async () => {
		app = await createMockAppModule(SessionModule);
		repository = app.get(getRepositoryToken(SessionEntity));
		userRepo = app.get(getRepositoryToken(UserEntity));

		user = await userRepo.save(MockUserEntity.get());
	});

	beforeEach(async () => {
		createDto = MockCreateSessionDto.get();

		const data = MockSessionEntity.get();
		entity = await repository.save(data);
	});

	afterEach(async () => {
		await repository.clear();
	});

	// --------------------------------------------------

	it('Should be defined', () => {
		expect(app).toBeDefined();
	});

	// -------------------------------------------------- \\

	describe('POST /login', () => {
		it('Can create a session', async () => {
			const response = await request(app.getHttpServer()).post(`${ENDPOINT}/login`).send(createDto).expect(HttpStatus.CREATED);

			expect(response.body.id).toEqual(user.id);
			expect(response.body.uuid).toEqual(user.uuid);
			expect(response.body.createdAt).toEqual(user.createdAt);

			expect(response.body.username).toEqual(user.username);

			await expect(wasLogged(TEST_NAME, `SessionController: Creating a new entity`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `SessionService: Creating a new entity`)).resolves.toBe(true);

			await expect(wasLogged(TEST_NAME, `SessionSubscriber: Entity by id ${response.body.id} was inserted`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `SessionService: Emitting entity by id: ${response.body.id}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('Should return an error when missing a payload', async () => {
			await request(app.getHttpServer()).post(`${ENDPOINT}/login`).send({}).expect(HttpStatus.BAD_REQUEST);
		});

		// --------------------------------------------------

		it('Should do what when a session already exists?', async () => {
			expect(true).toBe(false);
		});
	});

	// -------------------------------------------------- \\

	describe('PATCH /refresh', () => {
		it('Can refresh its JWT', async () => {
			const response = await request(app.getHttpServer())
				.patch(`${ENDPOINT}/refresh`)
				.set('Cookie', [`jwt=${expiredJwt}`])
				.expect(HttpStatus.OK);

			expect(response.body.id).toEqual(user.id);
			expect(response.body.uuid).toEqual(user.uuid);
			expect(response.body.createdAt).toEqual(user.createdAt);

			expect(response.body.username).toEqual(user.username);

			await expect(wasLogged(TEST_NAME, `SessionController: Updating entity by id ${entity.id}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `SessionService: Updating entity by id ${entity.id}`)).resolves.toBe(true);

			await expect(wasLogged(TEST_NAME, `SessionSubscriber: Entity by id ${entity.id} was updated`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `SessionService: Emitting entity by id: ${entity.id}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('Should return an error when missing a JWT', async () => {
			await request(app.getHttpServer()).patch(`${ENDPOINT}/refresh`).expect(HttpStatus.UNAUTHORIZED);
		});
	});

	// -------------------------------------------------- \\

	describe('DELETE /logout', () => {
		it('Should successfully delete its session', async () => {
			await request(app.getHttpServer())
				.delete(`${ENDPOINT}/logout`)
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(HttpStatus.NO_CONTENT);

			await expect(wasLogged(TEST_NAME, `SessionController: Deleting entity by id ${entity.id}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `SessionService: Deleting entity by id ${entity.id}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('Can logout when missing a JWT', async () => {
			await request(app.getHttpServer()).delete(`${ENDPOINT}/logout`).expect(HttpStatus.NO_CONTENT);

			await expect(wasLogged(TEST_NAME, `SessionController: Deleting entity by id ${entity.id}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `SessionService: Deleting entity by id ${entity.id}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('Can logout when using an expired JWT', async () => {
			await request(app.getHttpServer())
				.delete(`${ENDPOINT}/logout`)
				.set('Cookie', [`jwt=${expiredJwt}`])
				.expect(HttpStatus.NO_CONTENT);

			await expect(wasLogged(TEST_NAME, `SessionController: Deleting entity by id ${entity.id}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `SessionService: Deleting entity by id ${entity.id}`)).resolves.toBe(true);
		});
	});
});
