import { validate } from 'class-validator';
import { SessionResponseDto } from './SessionResponseDto';
import { MockCreateSessionDto } from '../../../__tests__/mocks/dto/MockSessionDto';
import { CreateSessionDto } from './CreateSessionDto';
import { falsyValues } from '../../../__tests__/helpers/falsyValues';
import { userConstants } from '../../../common/constants/userConstants';
import { MockUserEntity } from '../../../__tests__/mocks/entity/MockUserEntity';

describe("Session DTO's", () => {
	let createDto: CreateSessionDto;

	beforeEach(() => {
		createDto = MockCreateSessionDto.get();
	});

	describe('Create DTO', () => {
		it('Password must be a string adhering to min length', async () => {
			for (const value of falsyValues(userConstants.minPasswordLength)) {
				// @ts-expect-error: expects a string.
				createDto.password = value;

				const errors = await validate(createDto);
				expect(errors.length).toBeGreaterThanOrEqual(1);
			}
		});
	});

	// --------------------------------------------------

	describe('Response DTO', () => {
		it('Can be created from a user entity', async () => {
			const entity = MockUserEntity.get();
			const dto = SessionResponseDto.create(entity);

			expect(dto.id).toEqual(entity.id);
			expect(dto.uuid).toEqual(entity.uuid);
			expect(dto.createdAt).toEqual(entity.createdAt);

			expect(dto.username).toEqual(entity.username);
		});
	});
});
