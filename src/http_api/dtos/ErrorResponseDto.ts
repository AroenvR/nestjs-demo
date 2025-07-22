import { ApiProperty } from "@nestjs/swagger";
import { HttpStatus } from "@nestjs/common";
import { HttpExceptionMessages } from "../../common/enums/HttpExceptionMessages";
import { IHttpErrorResponseObj } from "../filters/IHttpErrorResponseObj";

/**
 * A Response DTO for errors in the HTTP API.
 * This DTO is used to standardize the error responses sent to a client.
 * It implements the {@link IHttpErrorResponseObj} interface.
 */
export class ErrorResponseDto implements IHttpErrorResponseObj {
	@ApiProperty({ description: "The status code of the error", example: HttpStatus.NOT_FOUND })
	status: HttpStatus;

	@ApiProperty({ description: "A message according to the status code", example: HttpExceptionMessages.NOT_FOUND })
	message: HttpExceptionMessages;

	@ApiProperty({ description: "The timestamp of when the request failed", example: 1711285967 })
	timestamp: number;

	@ApiProperty({ description: "The request path that returned the error", example: "/v1/auth/refresh" })
	path: string;

	constructor(data: IHttpErrorResponseObj) {
		this.status = data.status;
		this.message = data.message;
		this.timestamp = data.timestamp;
		this.path = data.path;
	}
}
