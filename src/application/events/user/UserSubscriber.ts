import { DataSource } from "typeorm";
import { Inject } from "@nestjs/common";
import { AbstractSubscriber } from "../AbstractSubscriber";
import { UserEntity } from "../../../domain/user/UserEntity";
import { UserService } from "../../services/user/UserService";
import { WinstonAdapter } from "../../../common/utility/logging/adapters/WinstonAdapter";

/**
 * Subscribes and publishes to events for the database's actions on the UserEntity table.
 * Extends the {@link AbstractSubscriber} class and implements the required listenTo operation.
 */
export class UserSubscriber extends AbstractSubscriber<UserEntity> {
	constructor(
		protected readonly logAdapter: WinstonAdapter,
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
