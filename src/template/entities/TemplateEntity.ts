import { Column, Entity } from 'typeorm';
import { AbstractCrudEntity } from '../../abstract/AbstractCrudEntity';

/**
 * A template entity class that represents a database table.
 * @column value TEXT NOT NULL UNIQUE
 */
@Entity()
export class TemplateEntity extends AbstractCrudEntity {
	@Column({ unique: true, nullable: false })
	value: string;

	constructor(entity: Partial<TemplateEntity>) {
		super(entity);
	}
}
