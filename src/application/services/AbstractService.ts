import { UUID } from "crypto";
import { EntityManager, Repository } from "typeorm";
import { Injectable, NotImplementedException, OnModuleInit } from "@nestjs/common";
import { Observable, Subject } from "rxjs";
import { CreateDto } from "../../http_api/dtos/CreateDto";
import { ResponseDto } from "../../http_api/dtos/ResponseDto";
import { UpdateDto } from "../../http_api/dtos/UpdateDto";
import { ISseMessage } from "../events/ISseMessage";
import { ILogger, IPrefixedLogger } from "../../common/utility/logging/ILogger";
import { AbstractEntity } from "../../domain/AbstractEntity";
import { ICrudService } from "./ICrudService";
import { IAccessCookie, IBearerToken } from "../../common/interfaces/JwtInterfaces";

/**
 * An abstract service class that enforces basic CRUD operations.
 * A default implementation will only throw the `Method not implemented` exception.
 */
@Injectable()
export abstract class AbstractService<Entity extends AbstractEntity> implements ICrudService<Entity>, OnModuleInit {
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
	 *
	 */
	public async create(_: CreateDto): Promise<Entity> {
		throw new NotImplementedException(`${this.name}: Abstract method not implemented`);
	}

	/**
	 *
	 */
	public async findAll(): Promise<Entity[]> {
		throw new NotImplementedException(`${this.name}: Abstract method not implemented`);
	}

	/**
	 *
	 */
	public async findOne(_: UUID): Promise<Entity> {
		throw new NotImplementedException(`${this.name}: Abstract method not implemented`);
	}

	/**
	 *
	 */
	public async update(_: UUID, __: UpdateDto): Promise<Entity> {
		throw new NotImplementedException(`${this.name}: Abstract method not implemented`);
	}

	/**
	 *
	 */
	public async remove(_: UUID): Promise<void> {
		throw new NotImplementedException(`${this.name}: Abstract method not implemented`);
	}

	/**
	 *
	 */
	public async observe(_: IBearerToken | IAccessCookie): Promise<Observable<ISseMessage<ResponseDto>>> {
		throw new NotImplementedException(`${this.name}: Abstract method not implemented`);
	}

	/**
	 *
	 */
	public async emit(_: Entity): Promise<void> {
		throw new NotImplementedException(`${this.name}: Abstract method not implemented`);
	}

	/**
	 * An emitter specific to insert events.
	 * This should be overwritten by a child that wants custom emitting logic.
	 */
	public async emitInsert(_: Entity): Promise<void> {
		await this.emit(_);
	}

	/**
	 * An emitter specific to update events.
	 * This should be overwritten by a child that wants custom emitting logic.
	 */
	public async emitUpdate(_: Entity): Promise<void> {
		await this.emit(_);
	}

	/**
	 * Triggered when this module is initialized.
	 */
	public async onModuleInit(): Promise<void> {
		return;
	}
}
