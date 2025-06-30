import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";
import { CreateDto } from "../CreateDto";
import { userConstants } from "../../../common/constants/userConstants";

/**
 * This class is responsible for receiving data from a client to log a user in.
 * It provides Swagger documentation for the API.
 * It JSON validates the following fields:
 * - password: string minimum 8 characters
 */
export class CreateLoginDto extends CreateDto {
	@ApiProperty({ description: "The user's password", required: true })
	@IsString({ message: "value must be a string" })
	@MinLength(userConstants.minPasswordLength, { message: `Password must be at least ${userConstants.minPasswordLength} characters long` })
	password: string;
}
