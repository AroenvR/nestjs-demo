import { UserEntity } from './UserEntity';

describe('UserEntity and its DTOs', () => {
	const USERNAME = 'test';

	// --------------------------------------------------

	it('Can create itself', () => {
		const entity = new UserEntity({ username: USERNAME });

		expect(entity).toBeInstanceOf(UserEntity);
		expect(entity.id).toBeUndefined();
		expect(entity.uuid).toBeTruthy();
		expect(entity.createdAt).toBeTruthy();
		expect(entity.username).toEqual(USERNAME);
	});

	// --------------------------------------------------

	it('Can be updated', () => {
		const UPDATED_USERNAME = 'Jane Doe';

		const entity = new UserEntity({ username: USERNAME });
		entity.update({ username: UPDATED_USERNAME });

		expect(entity.username).toEqual(UPDATED_USERNAME);
	});
});
