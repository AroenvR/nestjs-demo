import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../../domain/user/UserEntity';
import { ResponseDto } from '../ResponseDto';

/**
 * This class is responsible for returning a {@link UserEntity} to the client.
 * It provides Swagger documentation for the API.
 */
export class UserResponseDto extends ResponseDto {
	@ApiProperty({ description: 'The unique username of the user entity', uniqueItems: true, required: true })
	username: string;

	@ApiProperty({ description: 'The password of the user entity', required: true })
	password: string;

	constructor(entity: UserEntity) {
		super(entity);
		this.username = entity.username;
		this.password = entity.password;
	}

	/**
	 *
	 */
	static create(entity: UserEntity): UserResponseDto {
		return new UserResponseDto(entity);
	}
}
