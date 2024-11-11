// import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
// import { AbstractLoggingClass } from './AbstractLoggingClass';
// import { AbstractCrudEntity } from './AbstractCrudEntity';
// import { LogAdapter } from '../infrastructure/logging/LogAdapter';
// import { AbstractCrudService } from './AbstractCrudService';

// /**
//  * Subscribes and publishes to events on the database's INSERT and UPDATE actions.
//  */
// @EventSubscriber()
// export abstract class AbstractCrudSubscriber<Entity extends AbstractCrudEntity>
//     extends AbstractLoggingClass
//     implements EntitySubscriberInterface<Entity> {
//     constructor(
//         protected readonly logAdapter: LogAdapter,
//         protected readonly datasource: DataSource,
//         protected readonly service: AbstractCrudService<Entity, unknown, unknown>,
//     ) {
//         super(logAdapter);
//         datasource.subscribers.push(this);
//     }

//     /**
//      *
//      */
//     abstract listenTo(): Function | string; // eslint-disable-line

//     /**
//      *
//      */
//     afterInsert(event: InsertEvent<Entity>) {
//         if (!event) return;

//         this.logger.info(`Entity with id ${event.entity.id} was inserted`);
//         this.service.emit(event.entity);
//     }

//     /**
//      *
//      */
//     afterUpdate(event: UpdateEvent<Entity>) {
//         if (!event) return;

//         this.logger.info(`Entity with id ${event.entity.id} was updated`);
//         this.service.emit(event.entity as Entity);
//     }
// }
