import { CreateLoginDto } from "../../../http_api/dtos/login/CreateLoginDto";
import { MockUserEntity } from "../entity/MockUserEntity";

/**
 * A Mock {@link CreateLoginDto} for testing purposes.
 */
export class MockCreateLoginDto {
	private constructor() {}

	public static get() {
		const dto = new CreateLoginDto();

		dto.password = MockUserEntity.get().password;

		return dto;
	}
}
