// import { Injectable, NotImplementedException } from '@nestjs/common';
// import { EntityManager, Repository } from 'typeorm';
// import { LogAdapter } from '../infrastructure/logging/LogAdapter';
// import { AbstractLoggingClass } from './AbstractLoggingClass';
// import { ICrudService } from './ICrudService';
// import { AbstractCrudEntity } from './AbstractCrudEntity';
// import { AbstractCreateDto } from './AbstractCreateDto';
// import { AbstractUpdateDto } from './AbstractUpdateDto';
// import { Observable, Subject } from 'rxjs';
// import { ISseMessage } from './ISseMessage';

// /**
//  * An abstract service class that provides basic CRUD operations.
//  * A default implementation will only throw the `Method not implemented` exception.
//  */
// @Injectable()
// export abstract class AbstractCrudService<Entity extends AbstractCrudEntity, CreateDto extends AbstractCreateDto, UpdateDto extends AbstractUpdateDto>
// 	extends AbstractLoggingClass
// 	implements ICrudService<Entity, CreateDto, UpdateDto>
// {
// 	protected readonly events = new Subject<ISseMessage<Entity>>();

// 	constructor(
// 		protected readonly repository: Repository<Entity>,
// 		protected readonly entityManager: EntityManager,
// 		protected readonly logAdapter: LogAdapter,
// 	) {
// 		super(logAdapter);
// 	}

// 	/**
// 	 *
// 	 */
// 	public async create(_: CreateDto): Promise<Entity> {
// 		this.logger.info(`Creating a new entity`);
// 		throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
// 	}

// 	/**
// 	 *
// 	 */
// 	public async findAll(): Promise<Entity[]> {
// 		this.logger.info(`Finding all entities`);
// 		throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
// 	}

// 	/**
// 	 *
// 	 */
// 	public async findOne(id: number): Promise<Entity> {
// 		this.logger.info(`Finding entity with id ${id}`);
// 		throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
// 	}

// 	/**
// 	 *
// 	 */
// 	public async update(id: number, _: UpdateDto): Promise<Entity> {
// 		this.logger.info(`Updating entity with id ${id}`);
// 		throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
// 	}

// 	/**
// 	 *
// 	 */
// 	public async remove(id: number): Promise<void> {
// 		this.logger.info(`Deleting entity with id ${id}`);
// 		throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
// 	}

// 	/**
// 	 *
// 	 */
// 	public observe(): Observable<ISseMessage<Entity>> {
// 		this.logger.info(`Observing template events`);
// 		throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
// 	}

// 	/**
// 	 *
// 	 */
// 	public emit(entity: Entity): void {
// 		this.logger.info(`Emitting Entity with id: ${entity.id}`);
// 		throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
// 	}
// }
