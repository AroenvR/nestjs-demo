import { ApiProperty } from '@nestjs/swagger';
import { UUID } from 'crypto';
import { AbstractEntity } from '../../domain/AbstractEntity'; // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * ResponseDto represents the standardized API response object for returning an {@link AbstractEntity} to the client.
 * It provides Swagger documentation for the API.
 */
export class ResponseDto {
    @ApiProperty({ description: 'Unique autoincrement identifier of the entity', example: 1, uniqueItems: true })
    id: number;

    @ApiProperty({ description: 'Universally unique identifier of the entity', example: '550e8400-e29b-41d4-a716-446655440000', uniqueItems: true })
    uuid: UUID;

    @ApiProperty({
        description: 'Timestamp of when the entity was created using a UNIX timestamp',
        example: 1711285967,
        uniqueItems: true,
    })
    createdAt: number;

    protected constructor(entity: AbstractEntity) {
        this.id = entity.id;
        this.uuid = entity.uuid;
        this.createdAt = entity.createdAt;
    }
}
