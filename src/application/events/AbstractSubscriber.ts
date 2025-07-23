import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from "typeorm";
import { AbstractEntity } from "../../domain/AbstractEntity";
import { AbstractService } from "../services/AbstractService";
import { ILogger, IPrefixedLogger } from "../../infrastructure/logging/ILogger";
import { InternalServerErrorException } from "@nestjs/common";

/**
 * An abstract class to Subscribe to, and publish, events from the database's INSERT and UPDATE actions.
 */
@EventSubscriber()
export abstract class AbstractSubscriber<Entity extends AbstractEntity> implements EntitySubscriberInterface<Entity> {
	protected logger: ILogger;
	public readonly name: string;

	constructor(
		protected readonly logAdapter: IPrefixedLogger,
		protected readonly dataSource: DataSource,
		protected readonly service: AbstractService<Entity>,
	) {
		this.name = this.constructor.name;
		this.logger = logAdapter.getPrefixedLogger(this.name);
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
		if (!event.entity.uuid) throw new InternalServerErrorException(`${this.name}: Inserted entity did not have a UUID.`);

		this.logger.debug(`Entity by uuid ${event.entity.uuid} was inserted`);
		this.service.emitInsert(event.entity);
	}

	/**
	 * After an entity is updated in the database, the service's emit method is called.
	 */
	afterUpdate(event: UpdateEvent<Entity>) {
		if (!event) return;
		if (!event.entity.uuid) throw new InternalServerErrorException(`${this.name}: Updated entity did not have a UUID.`);

		this.logger.debug(`Entity by uuid ${event.entity.uuid} was updated`);
		this.service.emitUpdate(event.entity as Entity);
	}
}
