import { TAppStatusMessage } from "../../../common/types/TAppStatusMessage";
import { AppStatusResponseDto } from "../../../http_api/dtos/app_status/AppStatusResponseDto";

/**
 * A Mock {@link AppStatusResponseDto} for testing purposes.
 */
export class MockAppStatusResponseDto {
	private constructor() {}

	public static getWith(message: TAppStatusMessage) {
		const dto = AppStatusResponseDto.create(message);

		return dto;
	}
}
