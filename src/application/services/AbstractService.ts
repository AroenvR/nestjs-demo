import { EntityManager, Repository } from "typeorm";
import { Injectable, NotImplementedException, OnModuleInit } from "@nestjs/common";
import { AbstractEntity } from "../../domain/AbstractEntity";
import { CreateDto } from "../../http_api/dtos/CreateDto";
import { ResponseDto } from "../../http_api/dtos/ResponseDto";
import { UpdateDto } from "../../http_api/dtos/UpdateDto";
import { Observable, Subject } from "rxjs";
import { ISseMessage } from "../events/ISseMessage";
import { ILogger, IPrefixedLogger } from "../../infrastructure/logging/ILogger";

/**
 * An abstract service class that enforces basic CRUD operations.
 * A default implementation will only throw the `Method not implemented` exception.
 */
@Injectable()
export class AbstractService<CDTO extends CreateDto, UDTO extends UpdateDto, RDTO extends ResponseDto> implements OnModuleInit {
	protected logger: ILogger;
	protected readonly events = new Subject<ISseMessage<RDTO>>();

	constructor(
		protected readonly repository: Repository<AbstractEntity>,
		protected readonly entityManager: EntityManager,
		protected readonly logAdapter: IPrefixedLogger,
	) {
		this.logger = logAdapter.getPrefixedLogger(this.constructor.name);
	}

	/**
	 * Creates a new entity.
	 * @param dto A CreateDto object that represents the entity to be created.
	 * @returns A Promise that resolves to a ResponseDto object.
	 */
	public async create(_: CDTO): Promise<RDTO> {
		throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
	}

	/**
	 * Finds all entities.
	 * @returns A Promise that resolves to an array of ResponseDto objects.
	 */
	public async findAll(): Promise<RDTO[]> {
		throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
	}

	/**
	 * Finds an entity by its id.
	 * @param id The id of the entity to find.
	 * @returns A Promise that resolves to a ResponseDto object.
	 */
	public async findOne(_: number): Promise<RDTO> {
		throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
	}

	/**
	 * Updates an entity by its id.
	 * @param id The id of the entity to update.
	 * @param dto An UpdateDto object that represents the entity to be updated.
	 * @returns A Promise that resolves to a ResponseDto object.
	 */
	public async update(_: number, __: UDTO): Promise<RDTO> {
		throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
	}

	/**
	 * Removes an entity by its id.
	 * @param id The id of the entity to remove.
	 */
	public async remove(_: number): Promise<void> {
		throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
	}

	/**
	 * Allow constrollers to subscribe to database events.
	 * @returns An Observable that emits ISseMessage objects containing ResponseDto's.
	 */
	public async observe(): Promise<Observable<ISseMessage<RDTO>>> {
		throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
	}

	/**
	 * Emit an event to all subscribers.
	 * Emits a ResponseDto object.
	 * @param entity The entity's data emit.
	 */
	public async emit(_: AbstractEntity): Promise<void> {
		throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
	}

	/**
	 * Triggered when this module is initialized.
	 */
	public async onModuleInit(): Promise<void> {
		return;
	}
}
