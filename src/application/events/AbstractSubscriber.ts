import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { AbstractEntity } from '../../domain/entities/AbstractEntity';
import { LogAdapter } from '../../infrastructure/logging/LogAdapter';
import { AbstractService } from '../services/AbstractService';
import { CreateDto } from '../dtos/CreateDto';
import { UpdateDto } from '../dtos/UpdateDto';
import { ResponseDto } from '../dtos/ResponseDto';
import { ILogger } from '../../infrastructure/logging/ILogger';

/**
 * An abstract class to Subscribe to, and publish, events from the database's INSERT and UPDATE actions.
 */
@EventSubscriber()
export abstract class AbstractSubscriber<Entity extends AbstractEntity> implements EntitySubscriberInterface<Entity> {
	protected logger: ILogger;

	constructor(
		protected readonly logAdapter: LogAdapter,
		protected readonly dataSource: DataSource,
		protected readonly service: AbstractService<CreateDto, UpdateDto, ResponseDto>,
	) {
		this.logger = logAdapter.getPrefixedLogger(this.constructor.name);
		dataSource.subscribers.push(this);
	}

	/**
	 * An abstract method to listens to the entity's database events.
	 */
    abstract listenTo(): Function | string; // eslint-disable-line

	/**
	 * After an entity is inserted into the database, the service's emit method is called.
	 */
	afterInsert(event: InsertEvent<Entity>) {
		if (!event) return;

		this.logger.info(`Entity by id ${event.entity.id} was inserted`);
		this.service.emit(event.entity);
	}

	/**
	 * After an entity is updated in the database, the service's emit method is called.
	 */
	afterUpdate(event: UpdateEvent<Entity>) {
		if (!event) return;

		this.logger.info(`Entity by id ${event.entity.id} was updated`);
		this.service.emit(event.entity as Entity);
	}
}
