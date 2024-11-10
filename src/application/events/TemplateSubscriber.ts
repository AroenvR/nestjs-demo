// import { Inject } from '@nestjs/common';
// import { DataSource } from 'typeorm';
// import { TemplateEntity } from '../../domain/entities/TemplateEntity';
// import { LogAdapter } from '../../infrastructure/logging/LogAdapter';
// import { TemplateService } from '../services/TemplateService';
// import { AbstractCrudSubscriber } from '../../abstract/AbstractCrudSubscriber';

// /**
//  * Subscribes and publishes to events for the database's actions on the TemplateEntity table.
//  */
// export class TemplateSubscriber extends AbstractCrudSubscriber<TemplateEntity> {
// 	constructor(
// 		protected readonly logAdapter: LogAdapter,
// 		protected readonly datasource: DataSource,
// 		@Inject(TemplateService) protected readonly service: TemplateService,
// 	) {
// 		super(logAdapter, datasource, service);
// 	}

// 	public listenTo() {
// 		return TemplateEntity;
// 	}
// }
