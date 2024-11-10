import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserModule } from './UserModule';
import { CreateUserDto } from '../../../application/dtos/user/CreateUserDto';
import { UserEntity } from '../../../domain/entities/user/UserEntity';
import { wasLogged } from '../../../__tests__/helpers/wasLogged';
import { expiredJwt, mockJwt } from '../../../__tests__/mocks/mockJwt';
import { createMockAppModule } from '../../../__tests__/mocks/module/createMockAppModule';

const TEST_NAME = 'UserModule'; // Value to change
describe(TEST_NAME, () => {
	process.env.TEST_NAME = TEST_NAME; // Creates a log file named with this test's name.

	let app: INestApplication;
	let entityName: string;
	let repository: Repository<unknown>;

	let existingEntity: UserEntity; // Value to change

	const ENDPOINT = '/v1/user'; // Value to change

	beforeEach(async () => {
		app = await createMockAppModule(UserModule); // Value to change

		// Populate 1 entity for testing
		repository = app.get(getRepositoryToken(UserEntity)); // Value to change

		const dto = new CreateUserDto(); // Value to change
		dto.username = 'Initial'; // Value to change

		const entity = UserEntity.create(dto); // Value to change
		existingEntity = await repository.save(entity);

		entityName = entity.constructor.name;
	});

	afterEach(async () => {
		await repository.query(`DELETE FROM user_entity`); // Value to change
		await repository.query(`DELETE FROM sqlite_sequence WHERE name='user_entity'`); // For SQLite & Value to change
	});

	// --------------------------------------------------

	it('Should be defined', () => {
		expect(app).toBeDefined();
	});

	// -------------------------------------------------- \\

	describe('POST /user', () => {
		const data = { username: 'Bob' }; // Value to change

		it('Can create an entity', async () => {
			const response = { id: 2, username: 'Bob' }; // Value to change

			await request(app.getHttpServer())
				.post(ENDPOINT)
				.send(data)
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(201)
				.expect(response);

			await expect(wasLogged(TEST_NAME, `UserController: Creating a new entity`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `UserService: Creating a new entity`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('Should return an error when missing a JWT', async () => {
			await request(app.getHttpServer()).post(ENDPOINT).send(data).expect(401);
		});

		// --------------------------------------------------

		it('Should return an error when missing a payload', async () => {
			await request(app.getHttpServer())
				.post(ENDPOINT)
				.send({})
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(400);
		});

		// --------------------------------------------------

		it('Should return an error when inserting a duplicate entity', async () => {
			data.username = 'Initial'; // Value to change

			await request(app.getHttpServer())
				.post(ENDPOINT)
				.send(data)
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(409);
		});

		// --------------------------------------------------

		it('Should return an error when using an expired JWT', async () => {
			await request(app.getHttpServer())
				.post(ENDPOINT)
				.send(data)
				.set('Cookie', [`jwt=${expiredJwt}`])
				.expect(401);
		});
	});

	// -------------------------------------------------- \\

	describe('GET /user', () => {
		it('Finds all entities', async () => {
			const response = [{ id: 1, username: 'Initial' }]; // Value to change

			await request(app.getHttpServer())
				.get(ENDPOINT)
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(200)
				.expect(response);

			await expect(wasLogged(TEST_NAME, `UserController: Finding all entities`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `UserService: Finding all entities`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('Should return an error when missing a JWT', async () => {
			await request(app.getHttpServer()).get(ENDPOINT).expect(401);
		});

		// --------------------------------------------------

		it('Should return an error when using an expired JWT', async () => {
			await request(app.getHttpServer())
				.get(ENDPOINT)
				.set('Cookie', [`jwt=${expiredJwt}`])
				.expect(401);
		});
	});

	// -------------------------------------------------- \\

	describe('GET /user/:id', () => {
		const expected = { id: 1, username: 'Initial' }; // Value to change

		it('Can find an entity by id', async () => {
			await request(app.getHttpServer())
				.get(`${ENDPOINT}/${expected.id}`)
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(200)
				.expect(expected);

			await expect(wasLogged(TEST_NAME, `UserController: Finding entity by id ${expected.id}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `UserService: Finding entity by id ${expected.id}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('Should return an error when requesting a non-existent id', async () => {
			await request(app.getHttpServer())
				.get(`${ENDPOINT}/9999`)
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(404);
		});

		// --------------------------------------------------

		it('Should return an error when requesting with an invalid id format', async () => {
			await request(app.getHttpServer())
				.get(`${ENDPOINT}/abc`)
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(400);
		});

		// --------------------------------------------------

		it('Should return an error when missing a JWT', async () => {
			await request(app.getHttpServer()).get(`${ENDPOINT}/${expected.id}`).expect(401);
		});

		// --------------------------------------------------

		it('Should return an error when using an expired JWT', async () => {
			await request(app.getHttpServer())
				.get(`${ENDPOINT}/${expected.id}`)
				.set('Cookie', [`jwt=${expiredJwt}`])
				.expect(401);
		});
	});

	// -------------------------------------------------- \\

	describe('PATCH /user/:id', () => {
		const data = { username: 'Bob' }; // Value to change
		const expected = { id: 1, username: 'Bob' }; // Value to change

		it('Can update an entity', async () => {
			await request(app.getHttpServer())
				.patch(`${ENDPOINT}/${expected.id}`)
				.send(data)
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(200)
				.expect(expected);

			await expect(wasLogged(TEST_NAME, `UserController: Updating entity by id ${expected.id}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `UserService: Updating entity by id ${expected.id}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('Should return an error when updating a non-existent entity', async () => {
			await request(app.getHttpServer())
				.patch(`${ENDPOINT}/9999`)
				.send(data)
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(404);
		});

		// --------------------------------------------------

		it('Should return an error when missing a JWT', async () => {
			await request(app.getHttpServer()).patch(`${ENDPOINT}/${expected.id}`).send(data).expect(401);
		});

		// --------------------------------------------------

		it('Should return an error when using an expired JWT', async () => {
			await request(app.getHttpServer())
				.patch(`${ENDPOINT}/${expected.id}`)
				.send(data)
				.set('Cookie', [`jwt=${expiredJwt}`])
				.expect(401);
		});

		// --------------------------------------------------

		it('Should return an error when using an invalid data format', async () => {
			await request(app.getHttpServer())
				.patch(`${ENDPOINT}/${expected.id}`)
				.send({ username: 12345 })
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(400);
		});
	});
});
