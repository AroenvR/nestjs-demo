import { randomUUID } from "crypto";
import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./UserController";
import { MockService } from "../../../__tests__/mocks/service/MockService";
import { UserService } from "../../../application/services/user/UserService";
import { mockILogger } from "../../../__tests__/mocks/mockLogAdapter";
import { UserResponseDto } from "../../dtos/user/UserResponseDto";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";
import { MockCreateUserDto, MockUpdateUserDto } from "../../../__tests__/mocks/dto/MockUserDto";
import { MockUserEntity } from "../../../__tests__/mocks/entity/MockUserEntity";

describe("UserController Unit", () => {
	let controller: UserController;

	const UUID = randomUUID();
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

	it("Should be defined", () => {
		expect(controller).toBeDefined();
	});

	// -------------------------------------------------- \\

	describe("CREATE", () => {
		it("Can create an entity", async () => {
			const dto = MockCreateUserDto.get();

			await expect(controller.create(dto)).resolves.toEqual(mockedResponse);
			expect(mockILogger.log).toHaveBeenCalledWith(`Creating a new entity`);
		});
	});

	// -------------------------------------------------- \\

	describe("FIND ALL", () => {
		it("Finds all entities", async () => {
			await expect(controller.findAll()).resolves.toEqual([mockedResponse]);
			expect(mockILogger.log).toHaveBeenCalledWith(`Finding all entities`);
		});
	});

	// -------------------------------------------------- \\

	describe("FIND ONE", () => {
		it("Finds an entity by uuid", async () => {
			await expect(controller.findOne(UUID)).resolves.toEqual(mockedResponse);
			expect(mockILogger.log).toHaveBeenCalledWith(`Finding entity by uuid ${UUID}`);
		});
	});

	// -------------------------------------------------- \\

	describe("UPDATE", () => {
		it("Updates an entity", async () => {
			const dto = MockUpdateUserDto.get();

			await expect(controller.update(UUID, dto)).resolves.toEqual(mockedResponse);
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
