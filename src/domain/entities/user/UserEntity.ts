import Joi from 'joi';
import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../AbstractEntity';
import { userConstants } from '../../../common/constants/userConstants';

/**
 * Represents a user entity in the database.
 * @column username TEXT NOT NULL UNIQUE
 */
@Entity()
export class UserEntity extends AbstractEntity {
	@Column({ unique: true, nullable: false })
	username: string;

	constructor(entity: Partial<UserEntity>) {
		super(entity);

		if (entity) {
			this.username = entity.username;
		}
	}

	/**
	 */
	public update(entity: Partial<UserEntity>) {
		if (entity.username) this.username = entity.username;

		this.validate(this);
		return this;
	}

	/* Getters & Setters */

	protected get childSchema() {
		return Joi.object({
			username: Joi.string().min(userConstants.minUsernameLength).max(userConstants.maxUsernameLength).required(),
		});
	}
}
