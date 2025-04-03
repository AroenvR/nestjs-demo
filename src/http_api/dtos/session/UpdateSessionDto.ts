import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { SessionEntity } from '../../../domain/session/SessionEntity'; // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * This class is responsible for receiving data from a client to update a {@link SessionEntity}.
 * It provides Swagger documentation for the API.
 * It JSON validates the following fields:
 * - jwt: string
 */
export class UpdateSessionDto extends UpdateDto {
	@ApiProperty({ description: "The new JWT for the Session's session", uniqueItems: true, required: true })
	@IsString({ message: 'value must be a string' })
	jwt: string;
}
