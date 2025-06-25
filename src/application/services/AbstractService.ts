import { UUID } from "crypto";
import { EntityManager, Repository } from "typeorm";
import { Injectable, NotImplementedException, OnModuleInit } from "@nestjs/common";
import { Observable, Subject } from "rxjs";
import { CreateDto } from "../../http_api/dtos/CreateDto";
import { ResponseDto } from "../../http_api/dtos/ResponseDto";
import { UpdateDto } from "../../http_api/dtos/UpdateDto";
import { ISseMessage } from "../events/ISseMessage";
import { ILogger, IPrefixedLogger } from "../../infrastructure/logging/ILogger";
import { AbstractEntity } from "../../domain/AbstractEntity";

/**
 * An abstract service class that enforces basic CRUD operations.
 * A default implementation will only throw the `Method not implemented` exception.
 */
@Injectable()
export class AbstractService<Entity extends AbstractEntity> implements OnModuleInit {
	protected readonly name: string;
	protected readonly events = new Subject<ISseMessage<ResponseDto>>();
	protected logger: ILogger;

	constructor(
		protected readonly repository: Repository<Entity>,
		protected readonly entityManager: EntityManager,
		protected readonly logAdapter: IPrefixedLogger,
	) {
		this.name = this.constructor.name;
		this.logger = logAdapter.getPrefixedLogger(this.name);
	}

	/**
	 * Creates a new entity.
	 * @param dto A CreateDto object that represents the entity to be created.
	 * @returns A Promise that resolves to a ResponseDto object.
	 */
	public async create(_: CreateDto): Promise<Entity> {
		throw new NotImplementedException(`${this.name}: Abstract method not implemented`);
	}

	/**
	 * Finds all entities.
	 * @returns A Promise that resolves to an array of ResponseDto objects.
	 */
	public async findAll(): Promise<Entity[]> {
		throw new NotImplementedException(`${this.name}: Abstract method not implemented`);
	}

	/**
	 * Finds an entity by its id.
	 * @param id The id of the entity to find.
	 * @returns A Promise that resolves to a ResponseDto object.
	 */
	public async findOne(_: UUID): Promise<Entity> {
		throw new NotImplementedException(`${this.name}: Abstract method not implemented`);
	}

	/**
	 * Updates an entity by its id.
	 * @param id The id of the entity to update.
	 * @param dto An UpdateDto object that represents the entity to be updated.
	 * @returns A Promise that resolves to a ResponseDto object.
	 */
	public async update(_: UUID, __: UpdateDto): Promise<Entity> {
		throw new NotImplementedException(`${this.name}: Abstract method not implemented`);
	}

	/**
	 * Removes an entity by its id.
	 * @param id The id of the entity to remove.
	 */
	public async remove(_: UUID): Promise<void> {
		throw new NotImplementedException(`${this.name}: Abstract method not implemented`);
	}

	/**
	 * Allow constrollers to subscribe to database events.
	 * @returns An Observable that emits ISseMessage objects containing ResponseDto's.
	 */
	public async observe(): Promise<Observable<ISseMessage<ResponseDto>>> {
		throw new NotImplementedException(`${this.name}: Abstract method not implemented`);
	}

	/**
	 * Emit an event to all subscribers.
	 * Emits a ResponseDto object.
	 * @param entity The entity's data emit.
	 */
	public async emit(_: Entity): Promise<void> {
		throw new NotImplementedException(`${this.name}: Abstract method not implemented`);
	}

	/**
	 * Triggered when this module is initialized.
	 */
	public async onModuleInit(): Promise<void> {
		return;
	}
}
