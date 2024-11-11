import { DataSource } from 'typeorm';
import { Inject } from '@nestjs/common';
import { AbstractSubscriber } from '../AbstractSubscriber';
import { UserEntity } from '../../../domain/entities/user/UserEntity';
import { LogAdapter } from '../../../infrastructure/logging/LogAdapter';
import { UserService } from '../../services/user/UserService';

/**
 * Subscribes and publishes to events for the database's actions on the UserEntity table.
 * Extends the {@link AbstractSubscriber} class and implements the required listenTo operation.
 */
export class UserSubscriber extends AbstractSubscriber<UserEntity> {
	constructor(
		protected readonly logAdapter: LogAdapter,
		protected readonly dataSource: DataSource,
		@Inject(UserService) protected readonly service: UserService,
	) {
		super(logAdapter, dataSource, service);
	}

	/**
	 *
	 */
	public listenTo() {
		return UserEntity;
	}
}
