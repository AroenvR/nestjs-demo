import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../../abstract/AbstractEntity';

@Entity()
export class TemplateEntity extends AbstractEntity {
	@Column({ unique: true, nullable: false })
	value: string;

	constructor(entity: Partial<TemplateEntity>) {
		super(entity);
	}
}
