import { randomUUID } from 'crypto';
import { UserEntity } from '../../../domain/user/UserEntity';

/**
 * A Mock {@link UserEntity} for testing purposes.
 */
export class MockUserEntity {
	private constructor() {}

	public static get() {
		return UserEntity.create({
			id: 1001,
			uuid: randomUUID(),
			createdAt: Date.now(),
			username: 'Bob',
			password: '0a56afa3826b8f55e13216f04d774828491dcb27674e6602c9b6316e4ea6e207',
		});
	}
}
