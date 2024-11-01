import { ApiProperty } from '@nestjs/swagger';
import { validate, IsNumber, IsPositive, IsString, MinLength, validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { TemplateEntity } from '../entity/TemplateEntity';

export abstract class ResponseDto {
	// abstract validate(entity: TemplateResponseDto): boolean;
}

/**
 *
 */
export class TemplateResponseDto extends ResponseDto {
	@ApiProperty({ description: 'Unique identifier of the entity', uniqueItems: true })
	@IsNumber({}, { message: 'id must be a number' })
	@IsPositive({ message: 'id must be a positive number' })
	id: number;

	@ApiProperty({ description: 'The unique value of the entity', uniqueItems: true, required: true })
	@IsString({ message: 'value must be a string' })
	@MinLength(3, { message: 'Username must be at least 3 characters long' })
	value: string;

	// constructor(entity: TemplateEntity) {
	//     super();

	//     this.id = entity.id;
	//     this.value = entity.value;
	// }

	// validate(): boolean {
	//     const errors = validateSync(this);

	//     if (errors.length > 0) throw new Error(`${this.constructor.name}: Validation failed: ${errors.join(', ')}`);

	//     return true;
	// }
}
