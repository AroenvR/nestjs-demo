import { randomUUID } from "crypto";
import request from "supertest";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserModule } from "./UserModule";
import { CreateUserDto } from "../../dtos/user/CreateUserDto";
import { UserEntity } from "../../../domain/user/UserEntity";
import { wasLogged } from "../../../__tests__/helpers/wasLogged";
import { mockBearerToken, mockExpiredBearerToken, mockFaultyBearerToken } from "../../../__tests__/mocks/mockJwt";
import { createMockAppModule } from "../../../__tests__/mocks/module/createMockAppModule";
import { MockCreateUserDto, MockUpdateUserDto } from "../../../__tests__/mocks/dto/MockUserDto";
import { MockUserEntity } from "../../../__tests__/mocks/entity/MockUserEntity";
import { copyEntity } from "../../../__tests__/mocks/entity/copyEntity";
import { UserResponseDto } from "../../dtos/user/UserResponseDto";
import { UpdateUserDto } from "../../dtos/user/UpdateUserDto";

const TEST_NAME = "UserModule";
describe(TEST_NAME, () => {
	process.env.TEST_NAME = TEST_NAME; // Creates a log file named with this test's name.

	const ENDPOINT = "/v1/user";

	let app: INestApplication;
	let repository: Repository<UserEntity>;

	let entity: UserEntity;
	let createDto: CreateUserDto;
	let updateDto: UpdateUserDto;

	beforeAll(async () => {
		app = await createMockAppModule(UserModule);
		repository = app.get(getRepositoryToken(UserEntity));
	});

	beforeEach(async () => {
		createDto = MockCreateUserDto.get();
		updateDto = MockUpdateUserDto.get();

		const data = MockUserEntity.get();
		entity = await repository.save(data);
	});

	afterEach(async () => {
		await repository.clear();
	});

	afterAll(async () => {
		await app.close();
	});

	// --------------------------------------------------

	it("Should be defined", () => {
		expect(app).toBeDefined();
	});

	// -------------------------------------------------- \\

	describe("POST /user", () => {
		it("Can create an entity", async () => {
			const response = await request(app.getHttpServer())
				.post(ENDPOINT)
				.send(createDto)
				.set("Authorization", `Bearer ${mockBearerToken}`)
				.expect(HttpStatus.CREATED);

			expect(response.body.isDto).toEqual(true);

			expect(response.body.id).toBeTruthy();
			expect(response.body.uuid).toBeTruthy();
			expect(response.body.createdAt).toBeTruthy();

			expect(response.body.username).toEqual(createDto.username);
			expect(response.body.password).not.toBeDefined();

			// Verify the created entity in the database
			const found = await repository.findOne({ where: { id: response.body.id } });
			expect(found.username).toEqual(createDto.username);
			expect(found.password).toEqual(createDto.password);

			await expect(wasLogged(TEST_NAME, `UserController: Creating a new entity`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `UserService: Creating a new entity`)).resolves.toBe(true);

			await expect(wasLogged(TEST_NAME, `UserSubscriber: Entity by uuid ${response.body.uuid} was inserted`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `UserService: Emitting entity by uuid: ${response.body.uuid}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it("Should return an error when missing a JWT", async () => {
			await request(app.getHttpServer()).post(ENDPOINT).send(createDto).expect(HttpStatus.UNAUTHORIZED);
		});

		// --------------------------------------------------

		it("Should return an error when missing a payload", async () => {
			await request(app.getHttpServer())
				.post(ENDPOINT)
				.send({})
				.set("Authorization", `Bearer ${mockBearerToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		// --------------------------------------------------

		it("Should return an error when inserting a duplicate entity", async () => {
			const copy = copyEntity(entity);

			await request(app.getHttpServer())
				.post(ENDPOINT)
				.send(copy)
				.set("Authorization", `Bearer ${mockBearerToken}`)
				.expect(HttpStatus.CONFLICT);
		});

		// --------------------------------------------------

		it.only("Should return an error when using an expired JWT", async () => {
			await request(app.getHttpServer())
				.post(ENDPOINT)
				.send(createDto)
				.set("Authorization", `Bearer ${mockExpiredBearerToken}`)
				.expect(HttpStatus.UNAUTHORIZED);
		});

		// --------------------------------------------------

		it("Should return an error when using a faulty JWT", async () => {
			await request(app.getHttpServer())
				.post(ENDPOINT)
				.send(createDto)
				.set("Authorization", `Bearer ${mockFaultyBearerToken}`)
				.expect(HttpStatus.UNAUTHORIZED);
		});
	});

	// -------------------------------------------------- \\

	describe("GET /user", () => {
		it("Finds all entities", async () => {
			const response = await request(app.getHttpServer()).get(ENDPOINT).set("Authorization", `Bearer ${mockBearerToken}`).expect(HttpStatus.OK);

			const found = response.body.find((data: UserResponseDto) => data.id === entity.id);
			if (!found) throw new Error("Did not find the entity we expected.");

			expect(found.isDto).toEqual(true);

			expect(found.id).toEqual(entity.id);
			expect(found.uuid).toEqual(entity.uuid);
			expect(found.createdAt).toEqual(entity.createdAt);

			expect(found.username).toEqual(entity.username);
			expect(found.password).not.toBeDefined();

			await expect(wasLogged(TEST_NAME, `UserController: Finding all entities`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `UserService: Finding all entities`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it("Should return an error when missing a JWT", async () => {
			await request(app.getHttpServer()).get(ENDPOINT).expect(HttpStatus.UNAUTHORIZED);
		});

		// --------------------------------------------------

		it("Should return an error when using an expired JWT", async () => {
			await request(app.getHttpServer()).get(ENDPOINT).set("Authorization", `Bearer ${mockExpiredBearerToken}`).expect(HttpStatus.UNAUTHORIZED);
		});
	});

	// -------------------------------------------------- \\

	describe("GET /user/:uuid", () => {
		it("Can find an entity by uuid", async () => {
			const response = await request(app.getHttpServer())
				.get(`${ENDPOINT}/${entity.uuid}`)
				.set("Authorization", `Bearer ${mockBearerToken}`)
				.expect(HttpStatus.OK);

			expect(response.body.isDto).toEqual(true);

			expect(response.body.id).toEqual(entity.id);
			expect(response.body.uuid).toEqual(entity.uuid);
			expect(response.body.createdAt).toEqual(entity.createdAt);

			expect(response.body.username).toEqual(entity.username);
			expect(response.body.password).not.toBeDefined();

			await expect(wasLogged(TEST_NAME, `UserController: Finding entity by uuid ${entity.uuid}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `UserService: Finding entity by uuid ${entity.uuid}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it("Should return an error when requesting a non-existent uuid", async () => {
			await request(app.getHttpServer())
				.get(`${ENDPOINT}/${randomUUID()}`)
				.set("Authorization", `Bearer ${mockBearerToken}`)
				.expect(HttpStatus.NOT_FOUND);
		});

		// --------------------------------------------------

		it("Should return an error when requesting with an invalid uuid format", async () => {
			await request(app.getHttpServer())
				.get(`${ENDPOINT}/abc`)
				.set("Authorization", `Bearer ${mockBearerToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		// --------------------------------------------------

		it("Should return an error when missing a JWT", async () => {
			await request(app.getHttpServer()).get(`${ENDPOINT}/${entity.uuid}`).expect(HttpStatus.UNAUTHORIZED);
		});

		// --------------------------------------------------

		it("Should return an error when using an expired JWT", async () => {
			await request(app.getHttpServer())
				.get(`${ENDPOINT}/${entity.uuid}`)
				.set("Authorization", `Bearer ${mockExpiredBearerToken}`)
				.expect(HttpStatus.UNAUTHORIZED);
		});
	});

	// -------------------------------------------------- \\

	describe("PATCH /user/:uuid", () => {
		it("Can update an entity", async () => {
			const response = await request(app.getHttpServer())
				.patch(`${ENDPOINT}/${entity.uuid}`)
				.send(updateDto)
				.set("Authorization", `Bearer ${mockBearerToken}`)
				.expect(HttpStatus.OK);

			expect(response.body.isDto).toEqual(true);

			expect(response.body.id).toEqual(entity.id);
			expect(response.body.uuid).toEqual(entity.uuid);
			expect(response.body.createdAt).toEqual(entity.createdAt);

			expect(response.body.username).toEqual(updateDto.username);
			expect(response.body.password).not.toBeDefined();

			const updatedEntity = await repository.findOne({ where: { id: entity.id } });
			expect(updatedEntity.id).toEqual(entity.id);
			expect(updatedEntity.uuid).toEqual(entity.uuid);
			expect(updatedEntity.createdAt).toEqual(entity.createdAt);
			expect(updatedEntity.username).toEqual(updateDto.username);
			expect(updatedEntity.password).toEqual(updateDto.password);

			await expect(wasLogged(TEST_NAME, `UserController: Updating entity by uuid ${entity.uuid}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `UserService: Updating entity by uuid ${entity.uuid}`)).resolves.toBe(true);

			await expect(wasLogged(TEST_NAME, `UserSubscriber: Entity by uuid ${entity.uuid} was updated`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `UserService: Emitting entity by uuid: ${entity.uuid}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it("Should return an error when updating a non-existent entity", async () => {
			await request(app.getHttpServer())
				.patch(`${ENDPOINT}/${randomUUID()}`)
				.send(updateDto)
				.set("Authorization", `Bearer ${mockBearerToken}`)
				.expect(HttpStatus.NOT_FOUND);
		});

		// --------------------------------------------------

		it("Should return an error when missing a JWT", async () => {
			await request(app.getHttpServer()).patch(`${ENDPOINT}/${entity.uuid}`).send(updateDto).expect(HttpStatus.UNAUTHORIZED);
		});

		// --------------------------------------------------

		it("Should return an error when using an expired JWT", async () => {
			await request(app.getHttpServer())
				.patch(`${ENDPOINT}/${entity.uuid}`)
				.send(updateDto)
				.set("Authorization", `Bearer ${mockExpiredBearerToken}`)
				.expect(HttpStatus.UNAUTHORIZED);
		});

		// --------------------------------------------------

		it("Should return an error when using an invalid data format", async () => {
			await request(app.getHttpServer())
				.patch(`${ENDPOINT}/${entity.uuid}`)
				.send({ username: 12345 })
				.set("Authorization", `Bearer ${mockBearerToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});
	});

	// -------------------------------------------------- \\

	describe("DELETE /user/:uuid", () => {
		it("Should return an error when trying to delete a non-existent entity", async () => {
			await request(app.getHttpServer())
				.delete(`${ENDPOINT}/${randomUUID()}`)
				.set("Authorization", `Bearer ${mockBearerToken}`)
				.expect(HttpStatus.NOT_FOUND);
		});

		// --------------------------------------------------

		it("Should return an error when using an invalid id format", async () => {
			await request(app.getHttpServer())
				.delete(`${ENDPOINT}/abc`)
				.set("Authorization", `Bearer ${mockBearerToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		// --------------------------------------------------

		it("Should successfully delete an entity", async () => {
			await request(app.getHttpServer())
				.delete(`${ENDPOINT}/${entity.uuid}`)
				.set("Authorization", `Bearer ${mockBearerToken}`)
				.expect(HttpStatus.NO_CONTENT);

			const deletedEntity = await repository.findOne({ where: { id: entity.id } });
			expect(deletedEntity).toBeNull();

			await expect(wasLogged(TEST_NAME, `UserController: Deleting entity by uuid ${entity.uuid}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `UserService: Deleting entity by uuid ${entity.uuid}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it("Should return an error when missing a JWT", async () => {
			await request(app.getHttpServer()).delete(`${ENDPOINT}/${entity.uuid}`).expect(HttpStatus.UNAUTHORIZED);
		});

		// --------------------------------------------------

		it("Should return an error when using an expired JWT", async () => {
			await request(app.getHttpServer())
				.delete(`${ENDPOINT}/${entity.uuid}`)
				.set("Authorization", `Bearer ${mockExpiredBearerToken}`)
				.expect(HttpStatus.UNAUTHORIZED);
		});
	});
});
