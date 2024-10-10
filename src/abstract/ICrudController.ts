import { HttpStatus } from '@nestjs/common'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { ObjectLiteral } from 'typeorm';

/**
 * An interface that defines the basic CRUD operations for a controller.
 */
export interface ICrudController {
	/**
	 * Accepts POST requests to create a new entity.
	 * @param createDto A DTO object that represents the entity to be created.
	 * @returns The newly created entity with a {@link HttpStatus.OK}.
	 */
	create(createDto: ObjectLiteral): Promise<ObjectLiteral>;

	/**
	 * Accepts GET requests to find all entities.
	 * @returns An array of all entities with a {@link HttpStatus.OK}.
	 */
	findAll(): Promise<ObjectLiteral[]>;

	/**
	 * Accepts GET requests to find an entity by its id.
	 * @param id The id of the entity to find.
	 * @returns The entity with the specified id with a {@link HttpStatus.OK}.
	 */
	findOne(id: string): Promise<ObjectLiteral>;

	/**
	 * Accepts PATCH requests to update an entity by its id.
	 * @param id The id of the entity to update.
	 * @param updateDto A DTO object that represents the entity to be updated.
	 * @returns The updated entity with a {@link HttpStatus.OK}.
	 */
	update(id: string, updateDto: ObjectLiteral): Promise<ObjectLiteral>;

	/**
	 * Accepts DELETE requests to remove an entity by its id.
	 * @param id The id of the entity to remove with a {@link HttpStatus.NO_CONTENT}.
	 */
	remove(id: string): Promise<void>;
}