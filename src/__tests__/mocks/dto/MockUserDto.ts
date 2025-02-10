import { CreateUserDto } from '../../../http_api/dtos/user/CreateUserDto';
import { UpdateUserDto } from '../../../http_api/dtos/user/UpdateUserDto';

/**
 * A Mock {@link CreateUserDto} for testing purposes.
 */
export class MockCreateUserDto {
	private constructor() {}

	public static get() {
		const dto = new CreateUserDto();

		dto.username = 'Eve';
		dto.password = '97bb18bbfc561c340f84b2228ab9350bc6023f3dc373d95665ecc1ff2a4fdc6b';

		return dto;
	}
}

/**
 * A Mock {@link UpdateUserDto} for testing purposes.
 */
export class MockUpdateUserDto {
	private constructor() {}

	public static get() {
		const dto = new UpdateUserDto();

		dto.username = 'Alice';
		dto.password = '947ac62937bbcfa0a1dc86f1d7cd39b707677cf39a53f425efb3118c2ce1aee9';

		return dto;
	}
}
