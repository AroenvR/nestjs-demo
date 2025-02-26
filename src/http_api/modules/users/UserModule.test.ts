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
import { MockCreateUserDto, MockUpdateUserDto } from '../../../__tests__/mocks/dto/MockUserDto';
import { MockUserEntity } from '../../../__tests__/mocks/entity/MockUserEntity';
import { copyEntity } from '../../../__tests__/mocks/entity/copyEntity';
import { UserResponseDto } from '../../../http_api/dtos/user/UserResponseDto';
import { UpdateUserDto } from '../../../http_api/dtos/user/UpdateUserDto';

const TEST_NAME = 'UserModule'; // Value to change
describe(TEST_NAME, () => {
	process.env.TEST_NAME = TEST_NAME; // Creates a log file named with this test's name.

	const ENDPOINT = '/v1/user'; // Value to change

	let app: INestApplication;
	let repository: Repository<UserEntity>;

	let entity: UserEntity;
	let createDto: CreateUserDto;
	let updateDto: UpdateUserDto;

	beforeEach(async () => {
		app = await createMockAppModule(UserModule); // Value to change
		repository = app.get(getRepositoryToken(UserEntity)); // Value to change
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
		expect(app).toBeDefined();
	});

	// -------------------------------------------------- \\

	describe('POST /user', () => {
		it('Can create an entity', async () => {
			const response = await request(app.getHttpServer())
				.post(ENDPOINT)
				.send(createDto)
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(HttpStatus.CREATED);

			expect(response.body.id).toBeTruthy();
			expect(response.body.uuid).toBeTruthy();
			expect(response.body.createdAt).toBeTruthy();

			expect(response.body.username).toEqual(createDto.username);
			expect(response.body.password).toEqual(createDto.password);

			// Verify the created entity in the database

			const found = await repository.findOne({ where: { id: response.body.id } });

			expect(found).toEqual(response.body);

			expect(found.username).toEqual(createDto.username);
			expect(found.password).toEqual(createDto.password);

			await expect(wasLogged(TEST_NAME, `UserController: Creating a new entity`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `UserService: Creating a new entity`)).resolves.toBe(true);

			await expect(wasLogged(TEST_NAME, `UserSubscriber: Entity by id ${response.body.id} was inserted`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `UserService: Emitting entity by id: ${response.body.id}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('Should return an error when missing a JWT', async () => {
			await request(app.getHttpServer()).post(ENDPOINT).send(createDto).expect(HttpStatus.UNAUTHORIZED);
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
			const copy = copyEntity(entity);

			await request(app.getHttpServer())
				.post(ENDPOINT)
				.send(copy)
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(HttpStatus.CONFLICT);
		});

		// --------------------------------------------------

		it('Should return an error when using an expired JWT', async () => {
			await request(app.getHttpServer())
				.post(ENDPOINT)
				.send(createDto)
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

			const found = response.body.find((data: UserResponseDto) => data.id === entity.id);
			if (!found) fail('Did not find the entity we expected.');

			expect(found.id).toEqual(entity.id);
			expect(found.uuid).toEqual(entity.uuid);
			expect(found.createdAt).toEqual(entity.createdAt);

			expect(found.username).toEqual(entity.username);
			expect(found.password).toEqual(entity.password);

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
		it('Can find an entity by id', async () => {
			const response = await request(app.getHttpServer())
				.get(`${ENDPOINT}/${entity.id}`)
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(HttpStatus.OK);

			expect(response.body.id).toEqual(entity.id);
			expect(response.body.uuid).toEqual(entity.uuid);
			expect(response.body.createdAt).toEqual(entity.createdAt);

			expect(response.body.username).toEqual(entity.username);
			expect(response.body.password).toEqual(entity.password);

			await expect(wasLogged(TEST_NAME, `UserController: Finding entity by id ${entity.id}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `UserService: Finding entity by id ${entity.id}`)).resolves.toBe(true);
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
			await request(app.getHttpServer()).get(`${ENDPOINT}/${entity.id}`).expect(HttpStatus.UNAUTHORIZED);
		});

		// --------------------------------------------------

		it('Should return an error when using an expired JWT', async () => {
			await request(app.getHttpServer())
				.get(`${ENDPOINT}/${entity.id}`)
				.set('Cookie', [`jwt=${expiredJwt}`])
				.expect(HttpStatus.UNAUTHORIZED);
		});
	});

	// -------------------------------------------------- \\

	describe('PATCH /user/:id', () => {
		it('Can update an entity', async () => {
			const response = await request(app.getHttpServer())
				.patch(`${ENDPOINT}/${entity.id}`)
				.send(updateDto)
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(HttpStatus.OK);

			expect(response.body.id).toEqual(entity.id);
			expect(response.body.uuid).toEqual(entity.uuid);
			expect(response.body.createdAt).toEqual(entity.createdAt);

			expect(response.body.username).toEqual(updateDto.username);
			expect(response.body.password).toEqual(updateDto.password);

			const updatedEntity = await repository.findOne({ where: { id: entity.id } });
			expect(updatedEntity.id).toEqual(entity.id);
			expect(updatedEntity.uuid).toEqual(entity.uuid);
			expect(updatedEntity.createdAt).toEqual(entity.createdAt);
			expect(updatedEntity.username).toEqual(updateDto.username);
			expect(updatedEntity.password).toEqual(updateDto.password);

			await expect(wasLogged(TEST_NAME, `UserController: Updating entity by id ${entity.id}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `UserService: Updating entity by id ${entity.id}`)).resolves.toBe(true);

			await expect(wasLogged(TEST_NAME, `UserSubscriber: Entity by id ${entity.id} was updated`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `UserService: Emitting entity by id: ${entity.id}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('Should return an error when updating a non-existent entity', async () => {
			await request(app.getHttpServer())
				.patch(`${ENDPOINT}/9999`)
				.send(updateDto)
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(HttpStatus.NOT_FOUND);
		});

		// --------------------------------------------------

		it('Should return an error when missing a JWT', async () => {
			await request(app.getHttpServer()).patch(`${ENDPOINT}/${entity.id}`).send(updateDto).expect(HttpStatus.UNAUTHORIZED);
		});

		// --------------------------------------------------

		it('Should return an error when using an expired JWT', async () => {
			await request(app.getHttpServer())
				.patch(`${ENDPOINT}/${entity.id}`)
				.send(updateDto)
				.set('Cookie', [`jwt=${expiredJwt}`])
				.expect(HttpStatus.UNAUTHORIZED);
		});

		// --------------------------------------------------

		it('Should return an error when using an invalid data format', async () => {
			await request(app.getHttpServer())
				.patch(`${ENDPOINT}/${entity.id}`)
				.send({ username: 12345 })
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(HttpStatus.BAD_REQUEST);
		});
	});

	// -------------------------------------------------- \\

	describe('DELETE /user/:id', () => {
		it('Should successfully delete an entity', async () => {
			await request(app.getHttpServer())
				.delete(`${ENDPOINT}/${entity.id}`)
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(HttpStatus.NO_CONTENT);

			const deletedEntity = await repository.findOne({ where: { id: entity.id } });
			expect(deletedEntity).toBeNull();

			await expect(wasLogged(TEST_NAME, `UserController: Deleting entity by id ${entity.id}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `UserService: Deleting entity by id ${entity.id}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it('Should return an error when trying to delete a non-existent entity', async () => {
			await request(app.getHttpServer())
				.delete(`${ENDPOINT}/9999`)
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(HttpStatus.NOT_FOUND);
		});

		// --------------------------------------------------

		it('Should return an error when missing a JWT', async () => {
			await request(app.getHttpServer()).delete(`${ENDPOINT}/${entity.id}`).expect(HttpStatus.UNAUTHORIZED);
		});

		// --------------------------------------------------

		it('Should return an error when using an expired JWT', async () => {
			await request(app.getHttpServer())
				.delete(`${ENDPOINT}/${entity.id}`)
				.set('Cookie', [`jwt=${expiredJwt}`])
				.expect(HttpStatus.UNAUTHORIZED);
		});

		// --------------------------------------------------

		it('Should return an error when using an invalid id format', async () => {
			await request(app.getHttpServer())
				.delete(`${ENDPOINT}/abc`)
				.set('Cookie', [`jwt=${mockJwt}`])
				.expect(HttpStatus.BAD_REQUEST);
		});
	});
});
