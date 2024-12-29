import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { UserEntity } from '../../../domain/user/UserEntity';
import { ResponseDto } from '../ResponseDto';
import { userConstants } from '../../../common/constants/userConstants';

/**
 * This class is responsible for returning a {@link UserEntity} to the client.
 * It provides Swagger documentation for the API.
 * It JSON validates the following fields:
 * - username: string, at least 3 characters long.
 */
export class UserResponseDto extends ResponseDto {
	@ApiProperty({ description: 'The unique username of the user entity', uniqueItems: true, required: true })
	@IsString({ message: 'value must be a string' })
	@MinLength(userConstants.minUsernameLength, { message: `Username must be at least ${userConstants.minUsernameLength} characters long` })
	@MaxLength(userConstants.maxUsernameLength, { message: `Username can be at most ${userConstants.maxUsernameLength} characters long` })
	username: string;

	constructor(entity: UserEntity) {
		super(entity);
		this.username = entity.username;
	}

	static fromEntity(entity: UserEntity): UserResponseDto {
		return new UserResponseDto(entity);
	}
}
