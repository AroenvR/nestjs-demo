import { randomUUID } from "crypto";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserController } from "./UserController";
import { CreateUserDto } from "../../dtos/user/CreateUserDto";
import { UserEntity } from "../../../domain/user/UserEntity";
import { UserResponseDto } from "../../dtos/user/UserResponseDto";
import { wasLogged } from "../../../__tests__/helpers/wasLogged";
import { UpdateUserDto } from "../../dtos/user/UpdateUserDto";
import { GuardedController } from "../GuardedController";
import { createMockAppModule } from "../../../__tests__/mocks/module/createMockAppModule";
import { UserModule } from "../../modules/user/UserModule";
import { MockUserEntity } from "../../../__tests__/mocks/entity/MockUserEntity";
import { MockCreateUserDto, MockUpdateUserDto } from "../../../__tests__/mocks/dto/MockUserDto";

describe("UserController Integration", () => {
	const TEST_NAME = "UserController_Integration";
	process.env.TEST_NAME = TEST_NAME; // Creates a log file named with this test's name.

	let className: string;
	let controller: GuardedController;
	let repository: Repository<unknown>;

	let entity: UserEntity;
	let createDto: CreateUserDto;
	let updateDto: UpdateUserDto;

	beforeAll(async () => {
		const module = await createMockAppModule(UserModule);

		controller = module.get<UserController>(UserController);
		repository = module.get(getRepositoryToken(UserEntity));

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

	// --------------------------------------------------

	it("Should be defined", () => {
		expect(controller).toBeDefined();
	});

	// -------------------------------------------------- \\

	describe("CREATE", () => {
		it("Can create an entity", async () => {
			const created = (await controller.create(createDto)) as UserResponseDto;

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
			await expect(controller.findAll()).resolves.toEqual([UserResponseDto.create(entity)]);
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
			const response = UserResponseDto.create(entity);

			await expect(controller.findOne(entity.uuid)).resolves.toEqual(response);
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
			const response = UserResponseDto.create(entity.update(updateDto));

			await expect(controller.update(entity.uuid, updateDto)).resolves.toEqual(response);
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
