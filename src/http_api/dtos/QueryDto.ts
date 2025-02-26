import { UUID } from "crypto";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsNumber, IsUUID } from 'class-validator';
import { AbstractEntity } from '../../domain/AbstractEntity'; // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * This class is responsible for a controller's allowed query parameters to return an array of {@link AbstractEntity} objects from the database.
 */
export class QueryDto {
    @ApiProperty({ description: 'Whether to query for entities by ID' })
    @IsOptional()
    @IsNumber()
    id?: number;

    @ApiProperty({ description: 'Whether to query for entities by UUID' })
    @IsOptional()
    @IsUUID()
    uuid?: UUID;

    @ApiProperty({ description: 'Whether to query for entities by their creation time' })
    @IsOptional()
    @IsNumber()
    createdAt?: number;
}