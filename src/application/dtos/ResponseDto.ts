import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';
import { AbstractEntity } from '../../domain/entities/AbstractEntity';

/**
 * This class is responsible for returning a {@link AbstractEntity} to the client.
 * It provides Swagger documentation for the API.
 * It JSON validates the following fields:
 * - id: number, positive number.
 */
export class ResponseDto {
	@ApiProperty({ description: 'Unique identifier of the entity', uniqueItems: true })
	@IsNumber({}, { message: 'id must be a number' })
	@IsPositive({ message: 'id must be a positive number' })
	id: number;

	protected constructor(entity: AbstractEntity) {
		this.id = entity.id;
	}
}
