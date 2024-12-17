import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { UUID } from 'crypto';
import { AbstractEntity } from '../../domain/entities/AbstractEntity'; // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * ResponseDto represents the standardized API response object for returning an {@link AbstractEntity} to the client.
 * It provides Swagger documentation for the API.
 * It validates the following fields using a JSON schema:
 * - id: Unique autoincremented numeric identifier of the entity.
 * - uuid: A universally unique identifier of the entity.
 * - createdAt: A positive number representing the creation timestamp in UNIX epoch format.
 */
export class ResponseDto {
	@ApiProperty({ description: 'Unique autoincrement identifier of the entity', example: 1, uniqueItems: true })
	@IsNumber({}, { message: 'id must be a number' })
	@IsPositive({ message: 'id must be a positive number' })
	@Type(() => Number)
	id: number;

	@ApiProperty({ description: 'Universally unique identifier of the entity', example: '550e8400-e29b-41d4-a716-446655440000', uniqueItems: true })
	@IsUUID('4', { message: 'uuid must be a valid UUID v4' })
	uuid: UUID;

	@ApiProperty({
		description: 'Timestamp of when the entity was created using a UNIX timestamp',
		example: 1711285967,
		uniqueItems: true,
	})
	@IsNumber({}, { message: 'createdAt must be a number' })
	@IsPositive({ message: 'createdAt must be a positive number' })
	@Type(() => Number)
	createdAt: number;

	protected constructor(entity: AbstractEntity) {
		this.id = entity.id;
		this.uuid = entity.uuid;
		this.createdAt = entity.createdAt;
	}
}
