import { CreateUserDto, DatabaseEntityParent, UpdateUserDto, UserEntity, UserResponseDto } from './UserEntity';

describe('UserEntity and its DTOs', () => {
	const ID = 1;
	const USERNAME = 'test';

	// --------------------------------------------------

	it('Has can create itself', () => {
		const entity = UserEntity.create({ id: 1, username: 'test' });
		expect(entity).toBeDefined();
		expect(entity).toBeInstanceOf(UserEntity);
		expect(entity.id).toBeTruthy();
		expect(entity.id).toEqual(1);
		expect(typeof entity.id).toBe('number');

		expect(entity.username).toEqual(USERNAME);
		expect(typeof entity.username).toBe('string');
	});

	// --------------------------------------------------

	it('Can be created by a Create User DTO', () => {
		const createDto = new CreateUserDto();
		createDto.username = USERNAME;

		const entity = UserEntity.create(createDto);
		expect(entity).toBeDefined();
		expect(entity).toBeInstanceOf(UserEntity);

		expect(entity).toBeDefined();
		expect(entity).toBeInstanceOf(UserEntity);
		expect(entity.username).toEqual(USERNAME);
	});

	// --------------------------------------------------

	it('Can be created by an Update User DTO', () => {
		const updateDto = new UpdateUserDto();
		updateDto.id = ID;
		updateDto.username = USERNAME;

		const entity = UserEntity.create(updateDto);
		expect(entity).toBeDefined();
		expect(entity).toBeInstanceOf(UserEntity);

		expect(entity).toBeDefined();
		expect(entity).toBeInstanceOf(UserEntity);
		expect(entity.username).toEqual(USERNAME);
	});

	// --------------------------------------------------

	it('Can create a User Response DTO', () => {
		const entity = UserEntity.create({ id: 1, username: 'test' });
		const dto = UserResponseDto.fromEntity(entity);

		expect(dto).toBeDefined();
		expect(dto).toBeInstanceOf(UserResponseDto);
		expect(dto.id).toEqual(1);
		expect(dto.username).toEqual('test');
	});
});
