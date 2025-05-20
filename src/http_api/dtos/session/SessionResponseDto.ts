import { ApiProperty } from "@nestjs/swagger";
import { SessionEntity } from "../../../domain/session/SessionEntity"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { ResponseDto } from "../ResponseDto";
import { UserEntity } from "../../../domain/user/UserEntity";

/**
 * This class is responsible for returning a {@link SessionEntity} to the client.
 * It provides Swagger documentation for the API.
 */
export class SessionResponseDto extends ResponseDto {
	@ApiProperty({ description: "The user's username" })
	username: string;

	constructor(entity: Partial<UserEntity>) {
		super(entity);
		this.username = entity.username;
	}

	/**
	 *
	 */
	static create(entity: UserEntity): SessionResponseDto {
		return new SessionResponseDto(entity);
	}
}
