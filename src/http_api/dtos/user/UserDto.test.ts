import { validate } from 'class-validator';
import { UserEntity } from '../../../domain/user/UserEntity';
import { CreateUserDto } from './CreateUserDto';
import { UpdateUserDto } from './UpdateUserDto';
import { UserResponseDto } from './UserResponseDto';

describe("User DTO's", () => {
	const USERNAME = 'username';
	const PASSWORD = 'password';

	const INVALID_VALUES = [null, undefined, '', 0, true, false, [], {}, Symbol('')];

	describe('Create DTO', () => {
		const dto = new CreateUserDto();
		dto.username = USERNAME;
		dto.password = PASSWORD;

		it('Can be used to create the entity', async () => {
			const errors = await validate(dto);
			expect(errors.length).toEqual(0);

			const entity = new UserEntity(dto);
			expect(entity.username).toEqual(USERNAME);
			expect(entity.password).toEqual(PASSWORD);
		});

		// --------------------------------------------------

		it('Username must be a string', async () => {
			for (const value of INVALID_VALUES) {
				// @ts-expect-error: Username expects a string.
				dto.username = value;

				const errors = await validate(dto);
				expect(errors.length).toBeGreaterThanOrEqual(1);
			}
		});

		// --------------------------------------------------

		it('Password must be a string', async () => {
			for (const value of INVALID_VALUES) {
				// @ts-expect-error: Username expects a string.
				dto.password = value;

				const errors = await validate(dto);
				expect(errors.length).toBeGreaterThanOrEqual(1);
			}
		});
	});

	// --------------------------------------------------

	describe('Update DTO', () => {
		const dto = new UpdateUserDto();
		dto.username = USERNAME;
		dto.password = PASSWORD;

		it('Can be used to update the entity', async () => {
			const errors = await validate(dto);
			expect(errors.length).toEqual(0);

			const entity = new UserEntity({ username: 'initial', password: 'initial-password' });
			entity.update(dto);

			expect(entity.username).toEqual(USERNAME);
			expect(entity.password).toEqual(PASSWORD);
		});

		// --------------------------------------------------

		it('Username must be a string', async () => {
			for (const value of INVALID_VALUES) {
				// @ts-expect-error: Username expects a string.
				dto.username = value;

				const errors = await validate(dto);
				expect(errors.length).toBeGreaterThanOrEqual(1);
			}
		});

		// --------------------------------------------------

		it('Password must be a string', async () => {
			for (const value of INVALID_VALUES) {
				// @ts-expect-error: Username expects a string.
				dto.password = value;

				const errors = await validate(dto);
				expect(errors.length).toBeGreaterThanOrEqual(1);
			}
		});
	});

	// --------------------------------------------------

	describe('Response DTO', () => {
		it('Can be created from the entity', async () => {
			const entity = new UserEntity({ username: USERNAME, password: PASSWORD });
			entity.id = 1;

			const dto = new UserResponseDto(entity);

			expect(dto.username).toEqual(USERNAME);
			expect(dto.password).toEqual(PASSWORD);
		});
	});
});
