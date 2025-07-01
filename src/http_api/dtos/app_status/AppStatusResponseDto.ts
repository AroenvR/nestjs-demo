import { ApiProperty } from "@nestjs/swagger";
import { TAppStatusMessage } from "../../../common/types/TAppStatusMessage";

// TODO: test

/**
 * Data Transfer Object for the application status response.
 * This DTO is used to encapsulate the status of the application.
 * It includes a status property that indicates whether the application is running or blocked.
 */
export class AppStatusResponseDto {
	@ApiProperty({ description: "The status of the application", example: "running" })
	status: TAppStatusMessage;

	constructor(message: TAppStatusMessage) {
		this.status = message;
	}

	/**
	 *
	 */
	static create(message: TAppStatusMessage): AppStatusResponseDto {
		return new AppStatusResponseDto(message);
	}
}
