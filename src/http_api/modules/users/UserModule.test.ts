import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserModule } from './UserModule';
import { CreateUserDto } from '../../dtos/user/CreateUserDto';
import { UserEntity } from '../../../domain/user/UserEntity';
import { wasLogged } from '../../../__tests__/helpers/wasLogged';
import { expiredJwt, mockJwt } from '../../../__tests__/mocks/mockJwt';
import { createMockAppModule } from '../../../__tests__/mocks/module/createMockAppModule';

const TEST_NAME = 'UserModule'; // Value to change
describe(TEST_NAME, () => {
	process.env.TEST_NAME = TEST_NAME; // Creates a log file named with this test's name.

	let app: INestApplication;
	let repository: Repository<unknown>;

	const ENDPOINT = '/v1/user'; // Value to change
	const USERNAME = 'Initial'; // Value to change
	const PASSWORD = 'password'; // Value to change

	beforeEach(async () => {
		app = await createMockAppModule(UserModule); // Value to change

		// Populate 1 entity for testing
		repository = app.get(getRepositoryToken(UserEntity)); // Value to change

		const dto = new CreateUserDto(); // Value to change
		dto.username = USERNAME; // Value to change
		dto.password = PASSWORD; // Value to change

		const entity = new UserEntity(dto); // Value to change
		await repository.save(entity);
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
		const data = { username: 'Bob', password: 'something' }; // Value to change

		it('Can create an entity', async () => {
			const response = await request(app.getHttpServer())
				.post(ENDPOINT)
				.send(data)
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(HttpStatus.CREATED);

			expect(response.body.id).toEqual(3); // 3 because 1 is being seeded and 1 is being inserted in the beforeEach.
			expect(response.body.username).toEqual(data.username);
			expect(response.body.password).toEqual(data.password);

			await expect(wasLogged(TEST_NAME, `UserController: Creating a new entity`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `UserService: Creating a new entity`)).resolves.toBe(true);

			await expect(wasLogged(TEST_NAME, `UserSubscriber: Entity by id ${response.body.id} was inserted`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `UserService: Emitting entity by id: ${response.body.id}`)).resolves.toBe(true);
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
				.expect(HttpStatus.BAD_REQUEST);
		});

		// --------------------------------------------------

		it('Should return an error when inserting a duplicate entity', async () => {
			data.username = USERNAME; // Value to change

			await request(app.getHttpServer())
				.post(ENDPOINT)
				.send(data)
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(HttpStatus.CONFLICT);
		});

		// --------------------------------------------------

		it('Should return an error when using an expired JWT', async () => {
			await request(app.getHttpServer())
				.post(ENDPOINT)
				.send(data)
				.set('Cookie', [`jwt=${expiredJwt}`])
				.expect(HttpStatus.UNAUTHORIZED);
		});
	});

	// -------------------------------------------------- \\

	describe('GET /user', () => {
		it('Finds all entities', async () => {
			const response = await request(app.getHttpServer())
				.get(ENDPOINT)
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(HttpStatus.OK);

			expect(response.body.length).toBeGreaterThanOrEqual(1);
			expect(response.body[1].id).toEqual(2);
			expect(response.body[1].username).toEqual(USERNAME);
			expect(response.body[1].password).toEqual(PASSWORD);

			await expect(wasLogged(TEST_NAME, `UserController: Finding all entities`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `UserService: Finding all entities`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('Should return an error when missing a JWT', async () => {
			await request(app.getHttpServer()).get(ENDPOINT).expect(HttpStatus.UNAUTHORIZED);
		});

		// --------------------------------------------------

		it('Should return an error when using an expired JWT', async () => {
			await request(app.getHttpServer())
				.get(ENDPOINT)
				.set('Cookie', [`jwt=${expiredJwt}`])
				.expect(HttpStatus.UNAUTHORIZED);
		});
	});

	// -------------------------------------------------- \\

	describe('GET /user/:id', () => {
		const expected = { id: 2, username: USERNAME, password: PASSWORD }; // Value to change

		it('Can find an entity by id', async () => {
			const response = await request(app.getHttpServer())
				.get(`${ENDPOINT}/${expected.id}`)
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(HttpStatus.OK);

			expect(response.body.id).toEqual(expected.id);
			expect(response.body.username).toEqual(expected.username);
			expect(response.body.password).toEqual(expected.password);

			await expect(wasLogged(TEST_NAME, `UserController: Finding entity by id ${expected.id}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `UserService: Finding entity by id ${expected.id}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('Should return an error when requesting a non-existent id', async () => {
			await request(app.getHttpServer())
				.get(`${ENDPOINT}/9999`)
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(HttpStatus.NOT_FOUND);
		});

		// --------------------------------------------------

		it('Should return an error when requesting with an invalid id format', async () => {
			await request(app.getHttpServer())
				.get(`${ENDPOINT}/abc`)
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(HttpStatus.BAD_REQUEST);
		});

		// --------------------------------------------------

		it('Should return an error when missing a JWT', async () => {
			await request(app.getHttpServer()).get(`${ENDPOINT}/${expected.id}`).expect(HttpStatus.UNAUTHORIZED);
		});

		// --------------------------------------------------

		it('Should return an error when using an expired JWT', async () => {
			await request(app.getHttpServer())
				.get(`${ENDPOINT}/${expected.id}`)
				.set('Cookie', [`jwt=${expiredJwt}`])
				.expect(HttpStatus.UNAUTHORIZED);
		});
	});

	// -------------------------------------------------- \\

	describe('PATCH /user/:id', () => {
		const data = { username: 'Bob', password: 'something' }; // Value to change
		const expected = { id: 1, username: 'Bob', password: 'something' }; // Value to change

		it('Can update an entity', async () => {
			const response = await request(app.getHttpServer())
				.patch(`${ENDPOINT}/${expected.id}`)
				.send(data)
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(HttpStatus.OK);

			expect(response.body.id).toEqual(expected.id);
			expect(response.body.username).toEqual(expected.username);
			expect(response.body.password).toEqual(expected.password);

			await expect(wasLogged(TEST_NAME, `UserController: Updating entity by id ${expected.id}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `UserService: Updating entity by id ${expected.id}`)).resolves.toBe(true);

			await expect(wasLogged(TEST_NAME, `UserSubscriber: Entity by id ${expected.id} was updated`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `UserService: Emitting entity by id: ${expected.id}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('Should return an error when updating a non-existent entity', async () => {
			await request(app.getHttpServer())
				.patch(`${ENDPOINT}/9999`)
				.send(data)
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(HttpStatus.NOT_FOUND);
		});

		// --------------------------------------------------

		it('Should return an error when missing a JWT', async () => {
			await request(app.getHttpServer()).patch(`${ENDPOINT}/${expected.id}`).send(data).expect(HttpStatus.UNAUTHORIZED);
		});

		// --------------------------------------------------

		it('Should return an error when using an expired JWT', async () => {
			await request(app.getHttpServer())
				.patch(`${ENDPOINT}/${expected.id}`)
				.send(data)
				.set('Cookie', [`jwt=${expiredJwt}`])
				.expect(HttpStatus.UNAUTHORIZED);
		});

		// --------------------------------------------------

		it('Should return an error when using an invalid data format', async () => {
			await request(app.getHttpServer())
				.patch(`${ENDPOINT}/${expected.id}`)
				.send({ username: 12345 })
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(HttpStatus.BAD_REQUEST);
		});
	});
});
