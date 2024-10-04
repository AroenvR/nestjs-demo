import { PrimaryGeneratedColumn } from 'typeorm';
import { ICrudEntity } from './ICrudEntity';

/**
 * An abstract entity class that provides a unique auto-generated identifier.
 * @column id INTEGER PRIMARY KEY AUTOINCREMENT
 */
export abstract class AbstractCrudEntity implements ICrudEntity {
	@PrimaryGeneratedColumn()
	id: number;

	constructor(entity: Partial<AbstractCrudEntity>) {
		Object.assign(this, entity);
	}
}
