import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ILogger } from 'ts-log-adapter';
import { LogAdapter } from '../logging/LogAdapter';
import { EntityManager, ObjectLiteral, Repository } from 'typeorm';

/**
 * An abstract service class that provides basic CRUD operations.
 * A default implementation will only throw the `Method not implemented` exception.
 */
@Injectable()
export abstract class AbstractService {
	protected logger: ILogger;

	constructor(
		protected readonly repository: Repository<ObjectLiteral>,
		protected readonly entityManager: EntityManager,
		protected readonly logAdapter: LogAdapter,
	) {
		const name = this.constructor.name;
		this.logger = this.logAdapter.getPrefixedLogger(name);
	}

	async create(_: ObjectLiteral): Promise<ObjectLiteral> {
		this.logger.info(`Creating a new entity`);
		throw new HttpException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
	}

	async findAll(): Promise<ObjectLiteral[]> {
		this.logger.info(`Finding all entities`);
		throw new HttpException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
	}

	async findOne(id: number): Promise<ObjectLiteral> {
		this.logger.info(`Finding entity with id ${id}`);
		throw new HttpException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
	}

	async update(id: number, _: ObjectLiteral): Promise<ObjectLiteral> {
		this.logger.info(`Updating entity with id ${id}`);
		throw new HttpException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
	}

	async remove(id: number): Promise<void> {
		this.logger.info(`Deleting entity with id ${id}`);
		throw new HttpException('Method not implemented', HttpStatus.NOT_IMPLEMENTED);
	}
}
