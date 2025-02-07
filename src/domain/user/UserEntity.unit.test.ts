import { MockUpdateUserDto } from '../../__tests__/mocks/dto/MockUserDto';
import { MockUserEntity } from '../../__tests__/mocks/entity/MockUserEntity';
import { UserEntity } from './UserEntity';

describe('UserEntity and its DTOs', () => {
	let data: UserEntity;

	beforeEach(() => {
		data = MockUserEntity.get();
	});

	// --------------------------------------------------

	it('Can create itself from a partial object', () => {
		delete data.id;
		delete data.uuid;
		delete data.createdAt;

		const entity = UserEntity.create(data);

		expect(entity).toBeInstanceOf(UserEntity);
		expect(entity.id).toBeUndefined();
		expect(entity.uuid).toBeTruthy();
		expect(entity.createdAt).toBeTruthy();

		expect(entity.username).toEqual(data.username);
		expect(entity.password).toEqual(data.password);
	});

	// --------------------------------------------------

	it('Can create itself from a complete object', () => {
		const entity = UserEntity.create(data);

		expect(entity.id).toEqual(data.id);
		expect(entity.uuid).toEqual(data.uuid);
		expect(entity.createdAt).toEqual(data.createdAt);

		expect(entity.username).toEqual(data.username);
		expect(entity.password).toEqual(data.password);
	});

	// --------------------------------------------------

	it('Can be updated', () => {
		const updateData = MockUpdateUserDto.get();

		const entity = UserEntity.create(data);
		entity.update(updateData);

		expect(entity.username).toEqual(updateData.username);
		expect(entity.password).toEqual(updateData.password);
	});
});
