import { CreateSessionDto } from '../../../http_api/dtos/session/CreateSessionDto';
import { UpdateSessionDto } from '../../../http_api/dtos/session/UpdateSessionDto';
import { MockUserEntity } from '../entity/MockUserEntity';
import { mockJwt } from '../mockJwt';

/**
 * A Mock {@link CreateSessionDto} for testing purposes.
 */
export class MockCreateSessionDto {
	private constructor() {}

	public static get() {
		const dto = new CreateSessionDto();

		dto.password = MockUserEntity.get().password;

		return dto;
	}
}

/**
 * A Mock {@link UpdateSessionDto} for testing purposes.
 */
export class MockUpdateSessionDto {
	private constructor() {}

	public static get() {
		const dto = new UpdateSessionDto();

		dto.jwt = mockJwt;

		return dto;
	}
}
