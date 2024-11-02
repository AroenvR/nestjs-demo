import { Column, Entity } from 'typeorm';
import { AbstractCrudEntity } from '../../abstract/AbstractCrudEntity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * A template entity class that represents a database table.
 * @column value TEXT NOT NULL UNIQUE
 */
@Entity()
export class TemplateEntity extends AbstractCrudEntity {
	@Column({ unique: true, nullable: false })
	@ApiProperty({ description: 'The unique value of the entity', uniqueItems: true, required: true })
	value: string;

	constructor(entity: Partial<TemplateEntity>) {
		super(entity);
	}
}
