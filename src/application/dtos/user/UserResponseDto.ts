import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { UserEntity } from '../../../domain/entities/user/UserEntity';
import { ResponseDto } from '../ResponseDto';

/**
 * This class is responsible for returning a {@link UserEntity} to the client.
 * It provides Swagger documentation for the API.
 * It JSON validates the following fields:
 * - username: string, at least 3 characters long.
 */
export class UserResponseDto extends ResponseDto {
	@ApiProperty({ description: 'The unique username of the user entity', uniqueItems: true, required: true })
	@IsString({ message: 'value must be a string' })
	@MinLength(3, { message: 'Username must be at least 3 characters long' })
	username: string;

	private constructor(entity: UserEntity) {
		super(entity);
		this.username = entity.username;
	}

	static fromEntity(entity: UserEntity): UserResponseDto {
		return new UserResponseDto(entity);
	}
}
