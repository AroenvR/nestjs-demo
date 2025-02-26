import Joi from 'joi';
import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../AbstractEntity';
import { userConstants } from '../../common/constants/userConstants';
import { CreateUserDto } from '../../http_api/dtos/user/CreateUserDto';
import { UpdateUserDto } from '../../http_api/dtos/user/UpdateUserDto';

/**
 * Represents a user entity in the database.
 * @Column username TEXT NOT NULL UNIQUE
 * @Column password TEXT NOT NULL
 */
@Entity()
export class UserEntity extends AbstractEntity {
	@Column({ unique: true, nullable: false })
	username: string;

	@Column({ nullable: false })
	password: string;

	protected constructor(entity: Partial<UserEntity>) {
		super(entity);

		if (entity) {
			this.username = entity.username;
			this.password = entity.password;
		}
	}

	/**
	 *
	 */
	public static create(data: Partial<UserEntity> | CreateUserDto) {
		const parentData = UserEntity.parentDataHolder(data);

		const dataHolder: Partial<UserEntity> = {
			...parentData,
			username: data.username,
			password: data.password,
		};

		return new UserEntity(dataHolder);
	}

	/**
	 *
	 */
	public update(entity: Partial<UserEntity> | UpdateUserDto) {
		if (entity.username) this.username = entity.username;
		if (entity.password) this.password = entity.password;

		this.validate(this);
		return this;
	}

	/* Getters & Setters */

	protected get childSchema() {
		return Joi.object({
			username: Joi.string().min(userConstants.minUsernameLength).max(userConstants.maxUsernameLength).required(),
			password: Joi.string().required(),
		});
	}
}
