import { randomUUID } from "crypto";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./UserController";
import { MockService } from "../../../__tests__/mocks/service/MockService";
import { UserService } from "../../../application/services/user/UserService";
import { mockILogger } from "../../../__tests__/mocks/mockLogAdapter";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";
import { MockCreateUserDto, MockUpdateUserDto } from "../../../__tests__/mocks/dto/MockUserDto";
import { MockUserEntity } from "../../../__tests__/mocks/entity/MockUserEntity";
import { UserEntity } from "../../../domain/user/UserEntity";
import { serverConfig } from "../../../infrastructure/configuration/serverConfig";

describe("UserController.Unit", () => {
	let controller: UserController;

	const UUID = randomUUID();
	let mockedResponse: UserEntity;

	beforeEach(async () => {
		mockedResponse = MockUserEntity.get();

		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
			providers: [
				{
					provide: ConfigService,
					useValue: serverConfig(),
				},
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

	it("Should be defined", () => {
		expect(controller).toBeDefined();
	});

	// -------------------------------------------------- \\

	describe("CREATE", () => {
		it("Can create an entity", async () => {
			const dto = MockCreateUserDto.get();
			const response = await controller.create(dto);

			expect(response).toBeInstanceOf(UserEntity);
			expect(response).toEqual(mockedResponse);
			expect(mockILogger.log).toHaveBeenCalledWith(`Creating a new entity`);
		});
	});

	// -------------------------------------------------- \\

	describe("FIND ALL", () => {
		it("Finds all entities", async () => {
			const response = await controller.findAll();

			expect(response).toBeInstanceOf(Array);
			response.forEach((entity) => expect(entity).toBeInstanceOf(UserEntity));

			expect(response).toEqual([mockedResponse]);
			expect(mockILogger.log).toHaveBeenCalledWith(`Finding all entities`);
		});
	});

	// -------------------------------------------------- \\

	describe("FIND ONE", () => {
		it("Finds an entity by uuid", async () => {
			const response = await controller.findOne(UUID);

			expect(response).toBeInstanceOf(UserEntity);
			expect(response).toEqual(mockedResponse);
			expect(mockILogger.log).toHaveBeenCalledWith(`Finding entity by uuid ${UUID}`);
		});
	});

	// -------------------------------------------------- \\

	describe("UPDATE", () => {
		it("Updates an entity", async () => {
			const dto = MockUpdateUserDto.get();
			const response = await controller.update(UUID, dto);

			expect(response).toBeInstanceOf(UserEntity);
			expect(response).toEqual(mockedResponse);
			expect(mockILogger.log).toHaveBeenCalledWith(`Updating entity by uuid ${UUID}`);
		});
	});

	// -------------------------------------------------- \\

	describe("DELETE", () => {
		it("Deletes an entity", async () => {
			await expect(controller.remove(UUID)).resolves.toBeUndefined();
			expect(mockILogger.log).toHaveBeenCalledWith(`Deleting entity by uuid ${UUID}`);
		});
	});
});
