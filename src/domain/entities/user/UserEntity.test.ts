import { randomUUID } from 'crypto';
import { CreateUserDto } from '../../../application/dtos/user/CreateUserDto';
import { UpdateUserDto } from '../../../application/dtos/user/UpdateUserDto';
import { UserResponseDto } from '../../../application/dtos/user/UserResponseDto';
import { UserEntity } from './UserEntity';

describe('UserEntity and its DTOs', () => {
	const ID = 1;
	const UUID = randomUUID();
	const CREATED_AT = Date.now();
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

	it('Can be created by a Create User DTO', () => {
		const createDto = new CreateUserDto();
		createDto.username = USERNAME;

		const entity = new UserEntity(createDto);

		expect(entity).toBeInstanceOf(UserEntity);
		expect(entity.id).toBeUndefined();
		expect(entity.uuid).toBeTruthy();
		expect(entity.createdAt).toBeTruthy();
		expect(entity.username).toEqual(USERNAME);
	});

	// --------------------------------------------------

	it('Can be created by an Update User DTO', () => {
		const updateDto = new UpdateUserDto();
		updateDto.username = USERNAME;

		const entity = new UserEntity(updateDto);
		expect(entity.username).toEqual(USERNAME);

		entity.username = '123';

		const updated = entity.update(updateDto);
		expect(updated.username).toEqual(USERNAME);
	});

	// --------------------------------------------------

	it('Can create a User Response DTO', () => {
		const entity = new UserEntity({ id: ID, uuid: UUID, createdAt: CREATED_AT, username: USERNAME });
		const dto = UserResponseDto.fromEntity(entity);

		expect(dto).toBeInstanceOf(UserResponseDto);
		expect(dto.id).toEqual(ID);
		expect(dto.uuid).toEqual(UUID);
		expect(dto.createdAt).toEqual(CREATED_AT);
		expect(dto.username).toEqual(USERNAME);
	});
});
