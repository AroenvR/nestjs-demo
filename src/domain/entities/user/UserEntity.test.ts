import { CreateUserDto } from '../../../application/dtos/user/CreateUserDto';
import { UpdateUserDto } from '../../../application/dtos/user/UpdateUserDto';
import { UserResponseDto } from '../../../application/dtos/user/UserResponseDto';
import { UserEntity } from './UserEntity';

describe('UserEntity and its DTOs', () => {
	const ID = 1;
	const USERNAME = 'test';

	// --------------------------------------------------

	it('Can create itself', () => {
		const entity = UserEntity.create({ id: ID, username: USERNAME });

		expect(entity).toBeInstanceOf(UserEntity);
		expect(entity.id).toEqual(ID);
		expect(entity.username).toEqual(USERNAME);
	});

	// --------------------------------------------------

	it('Can be created by a Create User DTO', () => {
		const createDto = new CreateUserDto();
		createDto.username = USERNAME;

		const entity = UserEntity.create(createDto);

		expect(entity).toBeInstanceOf(UserEntity);
		expect(entity.username).toEqual(USERNAME);
	});

	// --------------------------------------------------

	it('Can be created by an Update User DTO', () => {
		const updateDto = new UpdateUserDto();
		updateDto.username = USERNAME;

		const entity = UserEntity.create(updateDto);

		expect(entity).toBeInstanceOf(UserEntity);
		expect(entity.username).toEqual(USERNAME);
	});

	// --------------------------------------------------

	it('Can create a User Response DTO', () => {
		const entity = UserEntity.create({ id: 1, username: 'test' });
		const dto = UserResponseDto.fromEntity(entity);

		expect(dto).toBeInstanceOf(UserResponseDto);
		expect(dto.id).toEqual(ID);
		expect(dto.username).toEqual(USERNAME);
	});
});
