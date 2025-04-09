import { randomUUID } from 'crypto';
import { SessionEntity } from '../../../domain/session/SessionEntity';
import { MockUserEntity } from './MockUserEntity';
import { mockJwt } from '../mockJwt';

/**
 * A Mock {@link SessionEntity} for testing purposes.
 */
export class MockSessionEntity {
	private constructor() {}

	public static get() {
		return SessionEntity.create({
			id: 1001,
			uuid: randomUUID(),
			createdAt: Date.now(),
			token: mockJwt,
			userUuid: MockUserEntity.get().uuid,
			refreshes: 0,
		});
	}
}
