import { randomUUID } from "crypto";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserController } from "./UserController";
import { CreateUserDto } from "../../dtos/user/CreateUserDto";
import { UserEntity } from "../../../domain/user/UserEntity";
import { wasLogged } from "../../../__tests__/helpers/wasLogged";
import { UpdateUserDto } from "../../dtos/user/UpdateUserDto";
import { createMockAppModule } from "../../../__tests__/mocks/module/createMockAppModule";
import { UserModule } from "../../modules/user/UserModule";
import { MockUserEntity } from "../../../__tests__/mocks/entity/MockUserEntity";
import { MockCreateUserDto, MockUpdateUserDto } from "../../../__tests__/mocks/dto/MockUserDto";
import { INestApplication } from "@nestjs/common";

const TEST_NAME = "UserController.Integration";
describe(TEST_NAME, () => {
	process.env.TEST_NAME = TEST_NAME; // Creates a log file named with this test's name.

	let app: INestApplication;

	let className: string;
	let controller: UserController;
	let repository: Repository<UserEntity>;

	let entity: UserEntity;
	let createDto: CreateUserDto;
	let updateDto: UpdateUserDto;

	beforeAll(async () => {
		app = await createMockAppModule(UserModule);

		controller = app.get(UserController);
		repository = app.get(getRepositoryToken(UserEntity));

		className = controller.constructor.name;
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
		expect(controller).toBeDefined();
	});

	// -------------------------------------------------- \\

	describe("CREATE", () => {
		it("Can create an entity", async () => {
			const created = await controller.create(createDto);
			expect(created).toBeInstanceOf(UserEntity);

			expect(created.username).toEqual(createDto.username);
			expect(created.password).toEqual(createDto.password);

			await expect(wasLogged(TEST_NAME, `${className}: Creating a new entity`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it("should fail with empty input", async () => {
			await expect(controller.create(null)).rejects.toThrow(`${className}: Create payload is empty.`);
		});
	});

	// -------------------------------------------------- \\

	describe("FIND ALL", () => {
		it("Finds all entities", async () => {
			const entities = await controller.findAll();

			expect(entities).toBeInstanceOf(Array);
			entities.forEach((data) => expect(data).toBeInstanceOf(UserEntity));

			expect(entities).toEqual([entity]);
			await expect(wasLogged(TEST_NAME, `${className}: Finding all entities`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it("Returns empty array when no entities are found", async () => {
			await repository.clear();
			await expect(controller.findAll()).resolves.toEqual([]);
		});

		// --------------------------------------------------

		it("should handle errors gracefully", async () => {
			jest.spyOn(controller["service"], "findAll").mockRejectedValue(new Error("Database error"));
			await expect(controller.findAll()).rejects.toThrow("Database error");
		});
	});

	// -------------------------------------------------- \\

	describe("FIND ONE", () => {
		it("Finds an entity by uuid", async () => {
			const response = await controller.findOne(entity.uuid);

			expect(response).toBeInstanceOf(UserEntity);
			expect(response).toEqual(entity);
			await expect(wasLogged(TEST_NAME, `${className}: Finding entity by uuid ${entity.uuid}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it("Fails to find an entity with a non-existent id", async () => {
			const nonExistentId = randomUUID();
			await expect(controller.findOne(nonExistentId)).rejects.toThrow(`Entity by uuid ${nonExistentId} not found`);
			await expect(wasLogged(TEST_NAME, `${className}: Finding entity by uuid ${nonExistentId}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it("should handle errors gracefully", async () => {
			jest.spyOn(controller["service"], "findOne").mockRejectedValue(new Error("Database error"));
			await expect(controller.findOne(randomUUID())).rejects.toThrow("Database error");
		});
	});

	// -------------------------------------------------- \\

	describe("UPDATE", () => {
		it("Updates an entity", async () => {
			const response = await controller.update(entity.uuid, updateDto);

			expect(response).toBeInstanceOf(UserEntity);
			expect(response).toEqual(entity.update(updateDto));
			await expect(wasLogged(TEST_NAME, `${className}: Updating entity by uuid ${entity.uuid}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it("Fails to update a non-existent entity", async () => {
			const nonExistentId = randomUUID();

			await expect(controller.update(nonExistentId, updateDto)).rejects.toThrow(`Entity by uuid ${nonExistentId} not found`);
			await expect(wasLogged(TEST_NAME, `${className}: Updating entity by uuid ${nonExistentId}`)).resolves.toBe(true);
		});
	});

	// -------------------------------------------------- \\

	describe("DELETE", () => {
		it("Deletes an entity", async () => {
			await expect(controller.remove(entity.uuid)).resolves.toBeUndefined();
			await expect(wasLogged(TEST_NAME, `${className}: Deleting entity by uuid ${entity.uuid}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it("Fails to delete an non-existent entity", async () => {
			const nonExistentId = randomUUID();

			await expect(controller.remove(nonExistentId)).rejects.toThrow(`Entity by uuid ${nonExistentId} not found`);
			await expect(wasLogged(TEST_NAME, `${className}: Deleting entity by uuid ${nonExistentId}`)).resolves.toBe(true);
		});
	});
});
