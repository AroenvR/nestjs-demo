import Joi from 'joi';
import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../AbstractEntity';

/**
 * Represents a user entity in the database.
 * @column username TEXT NOT NULL UNIQUE
 */
@Entity()
export class UserEntity extends AbstractEntity {
	@Column({ unique: true, nullable: false })
	username: string;

	protected constructor(entity: Partial<UserEntity>) {
		super(entity);

		if (entity) {
			this.username = entity.username;
		}
	}

	/**
	 * Factory method to create a new UserEntity.
	 */
	static create(entity: Partial<UserEntity>): UserEntity {
		return new UserEntity(entity);
	}

	/**
	 */
	public update(entity: Partial<UserEntity>): UserEntity {
		this.validate(entity);
		this.username = entity.username;

		return this;
	}

	/**
	 *
	 */
	protected validate(entity: Partial<UserEntity>): void {
		const { error } = Joi.object({
			id: Joi.number().positive(), // ID value is provided by the parent class.
			username: Joi.string().min(3).required(),
		})
			.required()
			.validate(entity);

		if (error) throw new Error(`${this.constructor.name}: validation error: ${error.message}`);
	}
}
