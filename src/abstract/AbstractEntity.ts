import { PrimaryGeneratedColumn } from 'typeorm';
import { IEntity } from './IEntity';

/**
 * An abstract entity class that provides a unique auto-generated identifier.
 * @column id INTEGER PRIMARY KEY AUTOINCREMENT
 */
export abstract class AbstractEntity implements IEntity {
	@PrimaryGeneratedColumn()
	id: number;

	constructor(entity: Partial<AbstractEntity>) {
		Object.assign(this, entity);
	}
}
