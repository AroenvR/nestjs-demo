// import { AbstractCrudEntity } from './AbstractCrudEntity';
// import { AbstractCreateDto } from './AbstractCreateDto';
// import { AbstractUpdateDto } from './AbstractUpdateDto';

// /**
//  * An interface that defines the service contract.
//  */
// export interface ICrudService<Entity extends AbstractCrudEntity, CreateDto extends AbstractCreateDto, UpdateDto extends AbstractUpdateDto> {
// 	/**
// 	 * Creates a new entity.
// 	 * @param _ A DTO object that represents the entity to be created.
// 	 */
// 	create(_: CreateDto): Promise<Entity>;

// 	/**
// 	 * Finds all entities.
// 	 */
// 	findAll(): Promise<Entity[]>;

// 	/**
// 	 * Finds an entity by its id.
// 	 * @param id The id of the entity to find.
// 	 */
// 	findOne(id: number): Promise<Entity>;

// 	/**
// 	 * Updates an entity by its id.
// 	 * @param id The id of the entity to update.
// 	 * @param _ A DTO object that represents the entity to be updated.
// 	 */
// 	update(id: number, _: UpdateDto): Promise<Entity>;

// 	/**
// 	 * Removes an entity by its id.
// 	 * @param id The id of the entity to remove.
// 	 */
// 	remove(id: number): Promise<void>;
// }
