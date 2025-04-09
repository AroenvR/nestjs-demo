import { CreateSessionDto } from '../../../http_api/dtos/session/CreateSessionDto';
import { MockUserEntity } from '../entity/MockUserEntity';

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
