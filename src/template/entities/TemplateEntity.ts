import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TemplateEntity {
	@PrimaryGeneratedColumn()
	id: number;

	constructor(entity: Partial<TemplateEntity>) {
		Object.assign(this, entity);
	}
}
