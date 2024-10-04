import { ObjectLiteral } from 'typeorm';

/**
 * An interface that defines the service contract.
 */
export interface ICrudService {
	/**
	 * Creates a new entity.
	 * @param _ A DTO object that represents the entity to be created.
	 */
	create(_: ObjectLiteral): Promise<ObjectLiteral>;

	/**
	 * Finds all entities.
	 */
	findAll(): Promise<ObjectLiteral[]>;

	/**
	 * Finds an entity by its id.
	 * @param id The id of the entity to find.
	 */
	findOne(id: number): Promise<ObjectLiteral>;

	/**
	 * Updates an entity by its id.
	 * @param id The id of the entity to update.
	 * @param _ A DTO object that represents the entity to be updated.
	 */
	update(id: number, _: ObjectLiteral): Promise<ObjectLiteral>;

	/**
	 * Removes an entity by its id.
	 * @param id The id of the entity to remove.
	 */
	remove(id: number): Promise<void>;
}
