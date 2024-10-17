import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { AbstractUpdateDto } from '../../abstract/AbstractUpdateDto';

export class UpdateTemplateDto extends AbstractUpdateDto {
	@ApiProperty({ description: 'The unique value of the entity', uniqueItems: true, required: true })
	@IsString({ message: 'value must be a string' })
	@MinLength(3, { message: 'Username must be at least 3 characters long' })
	value: string;
}
