import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from "typeorm";
import { TemplateEntity } from "./entities/TemplateEntity";
import { AbstractLoggingClass } from "../abstract/AbstractLoggingClass";
import { LogAdapter } from "../logging/LogAdapter";

/**
 * Publishes and subscribes to events for the database's actions on the TemplateEntity table.
 */
@EventSubscriber()
export class TemplateSubscriber extends AbstractLoggingClass implements EntitySubscriberInterface<TemplateEntity> {
    constructor(
        protected readonly datasource: DataSource,
        protected readonly logAdapter: LogAdapter,
    ) {
        super(logAdapter);
        datasource.subscribers.push(this);
    }

    afterInsert(event: InsertEvent<TemplateEntity>) {
        this.logger.info(`Entity with id ${event.entity.id} was inserted`);
    }

    afterUpdate(event: UpdateEvent<TemplateEntity>): Promise<any> | void {
        this.logger.info(`Entity with id ${event.entity.id} was updated`);
    }
}