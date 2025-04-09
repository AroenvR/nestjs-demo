import { MockSessionEntity } from '../../__tests__/mocks/entity/MockSessionEntity';
import { SessionEntity } from './SessionEntity';

describe("SessionEntity and its DTO's", () => {
	let data: SessionEntity;

	beforeEach(() => {
		data = MockSessionEntity.get();
	});

	// --------------------------------------------------

	it('Can create itself from a partial object', () => {
		delete data.id;
		delete data.uuid;
		delete data.createdAt;

		const entity = SessionEntity.create(data);

		expect(entity).toBeInstanceOf(SessionEntity);
		expect(entity.id).toBeUndefined();
		expect(entity.uuid).toBeTruthy();
		expect(entity.createdAt).toBeTruthy();

		expect(entity.userUuid).toEqual(data.userUuid);
		expect(entity.token).toEqual(data.token);
		expect(entity.refreshes).toEqual(data.refreshes);
	});

	// --------------------------------------------------

	it('Can create itself from a complete object', () => {
		const entity = SessionEntity.create(data);

		expect(entity.id).toEqual(data.id);
		expect(entity.uuid).toEqual(data.uuid);
		expect(entity.createdAt).toEqual(data.createdAt);

		expect(entity.userUuid).toEqual(data.userUuid);
		expect(entity.token).toEqual(data.token);
		expect(entity.refreshes).toEqual(data.refreshes);
	});

	// --------------------------------------------------

	it('Can refresh its token', () => {
		const entity = SessionEntity.create(data);

		const newToken = 'yolobolo';
		const currentRefreshes = entity.refreshes;

		entity.refreshToken(newToken);

		expect(entity.token).toEqual(newToken);
		expect(entity.refreshes).toEqual(currentRefreshes + 1);
	});

	// --------------------------------------------------

	it('Can not be updated', () => {
		const entity = SessionEntity.create(data);
		expect(() => entity.update({})).toThrow('Updating is not allowed');
	});
});
