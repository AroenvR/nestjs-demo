import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { userConstants } from '../../../common/constants/userConstants';

/**
 * This class is responsible for receiving data from a client to update a {@link UserEntity}.
 * It provides Swagger documentation for the API.
 * It JSON validates the following fields:
 * - username: string between 3 and 50 characters
 * - password: string minimum 8 characters
 */
export class UpdateUserDto extends UpdateDto {
	@ApiProperty({ description: 'The unique username of the user entity', uniqueItems: true, required: true })
	@IsOptional()
	@IsString({ message: 'value must be a string' })
	@MinLength(userConstants.minUsernameLength, { message: `Username must be at least ${userConstants.minUsernameLength} characters long` })
	@MaxLength(userConstants.maxUsernameLength, { message: `Username can be at most ${userConstants.maxUsernameLength} characters long` })
	username: string;

	@ApiProperty({ description: 'The password of the user entity', required: true })
	@IsOptional()
	@IsString({ message: 'value must be a string' })
	@MinLength(userConstants.minPasswordLength, { message: `Password must be at least ${userConstants.minPasswordLength} characters long` })
	password: string;
}
