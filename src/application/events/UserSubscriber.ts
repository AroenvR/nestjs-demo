import { EntitySubscriberInterface } from 'typeorm';
import { UserEntity } from '../../domain/entities/user/UserEntity';

export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
	// TODO: Abstract, Create & Test

	public listenTo() {
		return UserEntity;
	}
}
