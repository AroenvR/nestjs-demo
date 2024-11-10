import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { UpdateDto } from '../UpdateDto';

/**
 * This class is responsible for receiving data from a client to update a {@link UserEntity}.
 * It provides Swagger documentation for the API.
 * It JSON validates the following fields:
 * - username: string, at least 3 characters long.
 */
export class UpdateUserDto extends UpdateDto {
	@ApiProperty({ description: 'The unique username of the user entity', uniqueItems: true, required: true })
	@IsString({ message: 'value must be a string' })
	@MinLength(3, { message: 'Username must be at least 3 characters long' })
	@MaxLength(50, { message: 'Username must be at most 50 characters long' })
	username: string;
}
