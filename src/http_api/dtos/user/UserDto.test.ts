import { validate } from "class-validator";
import { UserEntity } from "../../../domain/user/UserEntity";
import { UpdateUserDto } from "./UpdateUserDto";
import { UserResponseDto } from "./UserResponseDto";
import { MockCreateUserDto, MockUpdateUserDto } from "../../../__tests__/mocks/dto/MockUserDto";
import { MockUserEntity } from "../../../__tests__/mocks/entity/MockUserEntity";
import { CreateUserDto } from "./CreateUserDto";
import { userConstants } from "../../../common/constants/userConstants";
import { falsyValues } from "../../../__tests__/helpers/falsyValues";

describe("User DTO's", () => {
	let createDto: CreateUserDto;
	let updateDto: UpdateUserDto;

	beforeEach(() => {
		createDto = MockCreateUserDto.get();
		updateDto = MockUpdateUserDto.get();
	});

	describe("Create DTO", () => {
		it("Can be used to create the entity", async () => {
			const errors = await validate(createDto);
			expect(errors.length).toEqual(0);

			const entity = UserEntity.create(createDto);
			expect(entity.username).toEqual(createDto.username);
			expect(entity.password).toEqual(createDto.password);
		});

		// --------------------------------------------------

		it("Username must be a string adhering to min/max lengths", async () => {
			for (const value of falsyValues(userConstants.minUsernameLength, userConstants.maxUsernameLength)) {
				// @ts-expect-error: expects a string.
				createDto.username = value;

				const errors = await validate(createDto);
				expect(errors.length).toBeGreaterThanOrEqual(1);
			}
		});

		// --------------------------------------------------

		it("Password must be a string adhering to min length", async () => {
			for (const value of falsyValues(userConstants.minPasswordLength)) {
				// @ts-expect-error: expects a string.
				createDto.password = value;

				const errors = await validate(createDto);
				expect(errors.length).toBeGreaterThanOrEqual(1);
			}
		});
	});

	// --------------------------------------------------

	describe("Update DTO", () => {
		it("Can be used to update the entity", async () => {
			const errors = await validate(updateDto);
			expect(errors.length).toEqual(0);

			const entity = MockUserEntity.get();
			entity.update(updateDto);

			expect(entity.username).toEqual(updateDto.username);
			expect(entity.password).toEqual(updateDto.password);
		});

		// --------------------------------------------------

		it("Username must be a string adhering to min/max length", async () => {
			for (const value of falsyValues(userConstants.minUsernameLength, userConstants.maxUsernameLength, true)) {
				// @ts-expect-error: Username expects a string.
				updateDto.username = value;

				const errors = await validate(updateDto);
				expect(errors.length).toBeGreaterThanOrEqual(1);
			}
		});

		// --------------------------------------------------

		it("Password must be a string adhering to min length", async () => {
			for (const value of falsyValues(userConstants.minPasswordLength, null, true)) {
				// @ts-expect-error: Username expects a string.
				updateDto.password = value;

				const errors = await validate(updateDto);
				expect(errors.length).toBeGreaterThanOrEqual(1);
			}
		});
	});

	// --------------------------------------------------

	describe("Response DTO", () => {
		it("Can be created from the entity", async () => {
			const entity = MockUserEntity.get();
			const dto = UserResponseDto.create(entity);

			expect(dto.id).toEqual(entity.id);
			expect(dto.uuid).toEqual(entity.uuid);
			expect(dto.createdAt).toEqual(entity.createdAt);

			expect(dto.username).toEqual(entity.username);
			expect(dto.password).toEqual(entity.password);
		});
	});
});
