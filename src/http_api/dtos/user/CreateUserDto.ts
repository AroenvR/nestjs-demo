import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { CreateDto } from '../CreateDto';
import { userConstants } from '../../../common/constants/userConstants';
import { UserEntity } from '../../../domain/user/UserEntity'; // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * This class is responsible for receiving data from a client to create a {@link UserEntity}.
 * It provides Swagger documentation for the API.
 * It JSON validates the following fields:
 * - username: string between 3 and 50 characters
 * - password: string minimum 8 characters
 */
export class CreateUserDto extends CreateDto {
	@ApiProperty({ description: 'The unique username of the user entity', uniqueItems: true, required: true })
	@IsString({ message: 'value must be a string' })
	@MinLength(userConstants.minUsernameLength, { message: `Username must be at least ${userConstants.minUsernameLength} characters long` })
	@MaxLength(userConstants.maxUsernameLength, { message: `Username can be at most ${userConstants.maxUsernameLength} characters long` })
	username: string;

	@ApiProperty({ description: 'The password of the user entity', required: true })
	@IsString({ message: 'value must be a string' })
	@MinLength(userConstants.minPasswordLength, { message: `Password must be at least ${userConstants.minPasswordLength} characters long` })
	password: string;
}
