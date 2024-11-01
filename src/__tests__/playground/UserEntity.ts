import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNumber, IsPositive, IsString, MinLength } from 'class-validator';
import Joi from 'joi';

/**
 * This abstract class represents any entity in the database.
 * It provides a unique auto-generated identifier and enforced validation.
 * @column id INTEGER PRIMARY KEY AUTOINCREMENT
 */
export abstract class DatabaseEntityParent {
	@PrimaryGeneratedColumn()
	id: number;

	protected constructor(entity: Partial<DatabaseEntityParent>) {
		this.validate(entity); // Validate the children.

		if (entity.id) this.id = entity.id;
	}

	/**
	 * Enforce children to create a JSON Schema validation.
	 * @param entity The entity to validate.
	 */
	protected abstract validate(entity: Partial<DatabaseEntityParent>): void;
}

/**
 * This class is responsible for receiving data from a client to create a {@link DatabaseEntityParent}.
 */
export class CreateDto {}

/**
 * This class is responsible for receiving data from a client to update a {@link DatabaseEntityParent}.
 * It provides Swagger documentation for the API.
 * It JSON validates the following fields:
 * - id: number, positive number.
 */
export class UpdateDto {
	@ApiProperty({ description: 'Unique identifier of the entity', uniqueItems: true })
	@IsNumber({}, { message: 'id must be a number' })
	@IsPositive({ message: 'id must be a positive number' })
	id: number;
}

/**
 * This class is responsible for returning a {@link DatabaseEntityParent} to the client.
 * It provides Swagger documentation for the API.
 * It JSON validates the following fields:
 * - id: number, positive number.
 */
export class ResponseDto {
	@ApiProperty({ description: 'Unique identifier of the entity', uniqueItems: true })
	@IsNumber({}, { message: 'id must be a number' })
	@IsPositive({ message: 'id must be a positive number' })
	id: number;

	protected constructor(entity: DatabaseEntityParent) {
		this.id = entity.id;
	}
}

// ----- USER OBJECTS -----

/**
 * This class is responsible for receiving data from a client to create a {@link UserEntity}.
 * It provides Swagger documentation for the API.
 * It JSON validates the following fields:
 * - username: string, at least 3 characters long.
 */
export class CreateUserDto extends CreateDto {
	@ApiProperty({ description: 'The unique username of the user entity', uniqueItems: true, required: true })
	@IsString({ message: 'value must be a string' })
	@MinLength(3, { message: 'Username must be at least 3 characters long' })
	username: string;
}

/**
 * This class is responsible for receiving data from a client to update a {@link UserEntity}.
 * It provides Swagger documentation for the API.
 * It JSON validates the following fields:
 * - username: string, at least 3 characters long.
 * @extends The {@link RequestDto} class for ease of use.
 */
export class UpdateUserDto extends UpdateDto {
	@ApiProperty({ description: 'The unique username of the user entity', uniqueItems: true, required: true })
	@IsString({ message: 'value must be a string' })
	@MinLength(3, { message: 'Username must be at least 3 characters long' })
	username: string;
}

/**
 * This class is responsible for returning a {@link UserEntity} to the client.
 * It provides Swagger documentation for the API.
 * It JSON validates the following fields:
 * - username: string, at least 3 characters long.
 */
export class UserResponseDto extends ResponseDto {
	@ApiProperty({ description: 'The unique username of the user entity', uniqueItems: true, required: true })
	@IsString({ message: 'value must be a string' })
	@MinLength(3, { message: 'Username must be at least 3 characters long' })
	username: string;

	private constructor(entity: UserEntity) {
		super(entity);
		this.username = entity.username;
	}

	static fromEntity(entity: UserEntity): UserResponseDto {
		return new UserResponseDto(entity);
	}
}

/**
 * Represents a user entity in the database.
 * @column username TEXT NOT NULL UNIQUE
 */
@Entity() // TODO: Move Entity to the parent?
export class UserEntity extends DatabaseEntityParent {
	@Column({ unique: true, nullable: false })
	username: string;

	private constructor(entity: Partial<UserEntity>) {
		super(entity);
		this.username = entity.username;
	}

	static create(dto: CreateUserDto | UpdateUserDto): UserEntity {
		return new UserEntity(dto);
	}

	protected validate(entity: Partial<UserEntity>): void {
		console.log(`Validation triggered`);

		const { error } = Joi.object({
			id: Joi.number().positive(), // ID value is provided by the parent class.
			username: Joi.string().min(3).required(),
		})
			.required()
			.validate(entity);

		if (error) throw new Error(`${this.constructor.name}: validation error: ${error.message}`);
	}
}

/**
 * An entity class represents a database table of its own name.
 * This AbstractEntity simply ensures that it always has an ID field.
 * When adding new fields, please document with the following format:
 * @column value TEXT NOT NULL UNIQUE
 */
// export class AbstractDatabaseEntity implements IDatabaseEntity {
//     @PrimaryGeneratedColumn()
//     id: number;

// constructor(entity: Partial<AbstractDatabaseEntity>) {
//     Object.assign(this, entity);
// }
// }

// /**
//  * An abstract entity class that provides a unique auto-generated identifier.
//  * It enforces children to implement a `create` method.
//  * @column id INTEGER PRIMARY KEY AUTOINCREMENT
//  * @implements the {@link IDatabaseEntity} interface. Check for more documentation.
//  */
// export abstract class AbstractDatabaseEntity {
//     @PrimaryGeneratedColumn()
//     id: number;

//     abstract create(): IDatabaseEntity;
// }

/**
 * A template entity class that represents a database table.
 * @column value TEXT NOT NULL UNIQUE
 */
// @Entity()
