import { Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * This abstract class represents any entity in the database.
 * It provides a unique auto-generated identifier and enforced validation.
 * @column id INTEGER PRIMARY KEY AUTOINCREMENT
 */
export abstract class AbstractEntity {
	@PrimaryGeneratedColumn()
	id: number;

	protected constructor(entity: Partial<AbstractEntity>) {
		if (entity) {
			this.validate(entity); // Validate the children.

			this.id = entity.id;
		}
	}

	/**
	 * Updates the entity with the provided data.
	 * @param entity The data to update the entity with.
	 */
	protected abstract update(entity: Partial<AbstractEntity>): AbstractEntity;

	/**
	 * Enforced JSON validation, executed by the parent.
	 * @param entity The entity to validate.
	 */
	protected abstract validate(entity: Partial<AbstractEntity>): void;
}
