import { UserEntity } from './UserEntity';

describe('UserEntity and its DTOs', () => {
	const USERNAME = 'test';
	const PASSWORD = 'password';

	// --------------------------------------------------

	it('Can create itself', () => {
		const entity = new UserEntity({ username: USERNAME, password: PASSWORD });

		expect(entity).toBeInstanceOf(UserEntity);
		expect(entity.id).toBeUndefined();
		expect(entity.uuid).toBeTruthy();
		expect(entity.createdAt).toBeTruthy();
		expect(entity.username).toEqual(USERNAME);
	});

	// --------------------------------------------------

	it('Can be updated', () => {
		const UPDATED_USERNAME = 'Jane Doe';
		const UPDATED_PASSWORD = 'password2';

		const entity = new UserEntity({ username: USERNAME, password: PASSWORD });
		entity.update({ username: UPDATED_USERNAME, password: UPDATED_PASSWORD });

		expect(entity.username).toEqual(UPDATED_USERNAME);
		expect(entity.password).toEqual(UPDATED_PASSWORD);
	});
});
