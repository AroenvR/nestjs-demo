import { ApiProperty } from "@nestjs/swagger";
import { UserEntity } from "../../../domain/user/UserEntity";
import { ResponseDto } from "../ResponseDto";

/**
 * This class is responsible for returning a {@link UserEntity} to the client.
 * It provides Swagger documentation for the API.
 */
export class UserResponseDto extends ResponseDto {
	@ApiProperty({ description: "The unique username of the user entity" })
	username: string;

	constructor(entity: UserEntity) {
		super(entity);
		this.username = entity.username;
	}

	/**
	 *
	 */
	static create(entity: UserEntity): UserResponseDto {
		return new UserResponseDto(entity);
	}
}
