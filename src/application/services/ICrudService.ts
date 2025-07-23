import { UUID } from "crypto";
import { Observable } from "rxjs";
import { CreateDto } from "../../http_api/dtos/CreateDto";
import { UpdateDto } from "../../http_api/dtos/UpdateDto";
import { ResponseDto } from "../../http_api/dtos/ResponseDto";
import { ISseMessage } from "../events/ISseMessage";
import { IAccessCookie, IBearerToken } from "../../common/interfaces/JwtInterfaces";

/**
 * Interface representing the minimum requirements for a CRUD service.
 */
export interface ICrudService<T> {
	/**
	 * Creates a new entity.
	 * @param dto A CreateDto object that represents the entity to be created.
	 * @returns A Promise that resolves to a ResponseDto object.
	 */
	create(_: CreateDto): Promise<T>;

	/**
	 * Finds all entities.
	 * @returns A Promise that resolves to an array of ResponseDto objects.
	 */
	findAll(): Promise<T[]>;

	/**
	 * Finds an entity by its id.
	 * @param id The id of the entity to find.
	 * @returns A Promise that resolves to a ResponseDto object.
	 */
	findOne(_: UUID): Promise<T>;

	/**
	 * Updates an entity by its id.
	 * @param id The id of the entity to update.
	 * @param dto An UpdateDto object that represents the entity to be updated.
	 * @returns A Promise that resolves to a ResponseDto object.
	 */
	update(_: UUID, __: UpdateDto): Promise<T>;

	/**
	 * Removes an entity by its id.
	 * @param id The id of the entity to remove.
	 */
	remove(_: UUID): Promise<void>;

	/**
	 * Allow controllers to subscribe to database events.
	 * @param jwt The JWT token used for authentication.
	 * @returns An Observable that emits ISseMessage objects containing ResponseDto's.
	 */
	observe(jwt: IBearerToken | IAccessCookie): Promise<Observable<ISseMessage<ResponseDto>>>;

	/**
	 * Emit an event to all subscribers.
	 * Emits a ResponseDto object.
	 * @param entity The entity's data emit.
	 */
	emit(_: T): Promise<void>;
}
