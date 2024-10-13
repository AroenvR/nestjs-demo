import { Injectable, NotImplementedException } from '@nestjs/common';
import { EntityManager, ObjectLiteral, Repository } from 'typeorm';
import { LogAdapter } from '../logging/LogAdapter';
import { AbstractLoggingClass } from './AbstractLoggingClass';
import { ICrudService } from './ICrudService';
import { AbstractCrudEntity } from './AbstractCrudEntity';

/**
 * An abstract service class that provides basic CRUD operations.
 * A default implementation will only throw the `Method not implemented` exception.
 */
@Injectable()
export abstract class AbstractCrudService extends AbstractLoggingClass implements ICrudService {
	constructor(
		protected readonly repository: Repository<AbstractCrudEntity>,
		protected readonly entityManager: EntityManager,
		protected readonly logAdapter: LogAdapter,
	) {
		super(logAdapter);
	}

	/**
	 *
	 */
	public async create(_: ObjectLiteral): Promise<AbstractCrudEntity> {
		this.logger.info(`Creating a new entity`);
		throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
	}

	/**
	 *
	 */
	public async findAll(): Promise<AbstractCrudEntity[]> {
		this.logger.info(`Finding all entities`);
		throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
	}

	/**
	 *
	 */
	public async findOne(id: number): Promise<AbstractCrudEntity> {
		this.logger.info(`Finding entity with id ${id}`);
		throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
	}

	/**
	 *
	 */
	public async update(id: number, _: ObjectLiteral): Promise<AbstractCrudEntity> {
		this.logger.info(`Updating entity with id ${id}`);
		throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
	}

	/**
	 *
	 */
	public async remove(id: number): Promise<void> {
		this.logger.info(`Deleting entity with id ${id}`);
		throw new NotImplementedException(`${this.constructor.name}: Abstract method not implemented`);
	}
}
