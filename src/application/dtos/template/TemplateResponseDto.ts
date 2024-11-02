import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { ResponseDto } from '../ResponseDto';
import { TemplateEntity } from 'src/domain/entities/TemplateEntity';

// /**
//  *
//  */
// export class TemplateResponseDto extends ResponseDto {
// 	@ApiProperty({ description: 'The unique value of the entity', uniqueItems: true, required: true })
// 	@IsString({ message: 'value must be a string' })
// 	@MinLength(3, { message: 'Username must be at least 3 characters long' })
// 	value: string;

// 	private constructor(entity: TemplateEntity) {
// 		super(entity);
// 		this.value = entity.value;
// 	}

// 	static fromEntity(entity: TemplateEntity): TemplateResponseDto {
// 		return new TemplateResponseDto(entity);
// 	}
// }
