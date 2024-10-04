import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../../abstract/AbstractEntity';

/**
 * A template entity class that represents a database table.
 * @column value TEXT NOT NULL UNIQUE
 */
@Entity()
export class TemplateEntity extends AbstractEntity {
	@Column({ unique: true, nullable: false })
	value: string;

	constructor(entity: Partial<TemplateEntity>) {
		super(entity);
	}
}
