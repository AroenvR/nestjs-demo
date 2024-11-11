// import { Observable } from 'rxjs';
// import { CreateDto } from '../dtos/CreateDto';
// import { ResponseDto } from '../dtos/ResponseDto';
// import { UpdateDto } from '../dtos/UpdateDto';
// import { ISseMessage } from '../events/ISseMessage';
// import { AbstractEntity } from 'src/domain/entities/AbstractEntity';

// /**
//  * This interface is used to define the contract for a service class that provides basic CRUD operations.
//  * @property { events } Observable<ISseMessage<ResponseDto>> - An Observable that emits {@link ISseMessage} objects.
//  */
// export interface IService<C extends CreateDto, U extends UpdateDto, R extends ResponseDto> {
// 	events: Observable<ISseMessage<R>>;

// 	/**
// 	 * Creates a new entity.
// 	 * @param dto A CreateDto object that represents the entity to be created.
// 	 * @returns A Promise that resolves to a ResponseDto object.
// 	 */
// 	create(dto: C): Promise<R>;

// 	/**
// 	 * Finds all entities.
// 	 * @returns A Promise that resolves to an array of ResponseDto objects.
// 	 */
// 	findAll(): Promise<R[]>;

// 	/**
// 	 * Finds an entity by its id.
// 	 * @param id The id of the entity to find.
// 	 * @returns A Promise that resolves to a ResponseDto object.
// 	 */
// 	findOne(id: number): Promise<R>;

// 	/**
// 	 * Updates an entity by its id.
// 	 * @param id The id of the entity to update.
// 	 * @param dto An UpdateDto object that represents the entity to be updated.
// 	 * @returns A Promise that resolves to a ResponseDto object.
// 	 */
// 	update(id: number, dto: U): Promise<R>;

// 	/**
// 	 * Removes an entity by its id.
// 	 * @param id The id of the entity to remove.
// 	 */
// 	remove(id: number): Promise<void>;

// 	/**
// 	 * Allow constrollers to subscribe to database events.
// 	 * @returns An Observable that emits ISseMessage objects containing ResponseDto's.
// 	 */
// 	observe(): Observable<ISseMessage<R>>;

// 	/**
// 	 * Emit an event to all subscribers.
// 	 * Emits a ResponseDto object.
// 	 * @param entity The entity's data emit.
// 	 */
// 	emit(entity: AbstractEntity): void;
// }
