// import { HttpStatus } from '@nestjs/common'; // eslint-disable-line @typescript-eslint/no-unused-vars
// import { AbstractCrudEntity } from './AbstractCrudEntity';
// import { AbstractCreateDto } from './AbstractCreateDto';
// import { AbstractUpdateDto } from './AbstractUpdateDto';
// import { ISseMessage } from './ISseMessage';
// import { Observable } from 'rxjs';

// /**
//  * An interface that defines the basic CRUD operations for a controller.
//  */
// export interface ICrudController<Entity extends AbstractCrudEntity, CreateDto extends AbstractCreateDto, UpdateDto extends AbstractUpdateDto> {
// 	/**
// 	 * Accepts POST requests to create a new entity.
// 	 * @param createDto A DTO object that represents the entity to be created.
// 	 * @returns The newly created entity with a {@link HttpStatus.OK}.
// 	 */
// 	create(createDto: CreateDto): Promise<Entity>;

// 	/**
// 	 * Accepts GET requests to find all entities.
// 	 * @returns An array of all entities with a {@link HttpStatus.OK}.
// 	 */
// 	findAll(): Promise<Entity[]>;

// 	/**
// 	 * Accepts GET requests to listen for events.
// 	 * @returns An observable of entity events.
// 	 */
// 	events(): Observable<ISseMessage<Entity>>;

// 	/**
// 	 * Accepts GET requests to find an entity by its id.
// 	 * @param id The id of the entity to find.
// 	 * @returns The entity with the specified id with a {@link HttpStatus.OK}.
// 	 */
// 	findOne(id: number): Promise<Entity>;

// 	/**
// 	 * Accepts PATCH requests to update an entity by its id.
// 	 * @param id The id of the entity to update.
// 	 * @param updateDto A DTO object that represents the entity to be updated.
// 	 * @returns The updated entity with a {@link HttpStatus.OK}.
// 	 */
// 	update(id: number, updateDto: UpdateDto): Promise<Entity>;

// 	/**
// 	 * Accepts DELETE requests to remove an entity by its id.
// 	 * @param id The id of the entity to remove with a {@link HttpStatus.NO_CONTENT}.
// 	 */
// 	remove(id: number): Promise<void>;
// }
