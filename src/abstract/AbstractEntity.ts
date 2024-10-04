import { PrimaryGeneratedColumn } from 'typeorm';

export abstract class AbstractEntity {
	@PrimaryGeneratedColumn()
	id: number;

	constructor(entity: Partial<AbstractEntity>) {
		Object.assign(this, entity);
	}
}
