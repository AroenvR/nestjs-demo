import Joi from 'joi';
import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../AbstractEntity';
import { userConstants } from '../../common/constants/userConstants';
import { CreateUserDto } from 'src/http_api/dtos/user/CreateUserDto';

/**
 * Represents a user entity in the database.
 * @column username TEXT NOT NULL UNIQUE
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
    public static create(data: UserEntity | CreateUserDto) {
        return new UserEntity(data);
    }

    /**
     *
     */
    public update(entity: Partial<UserEntity>) {
        if (entity.username) this.username = entity.username;
        if (entity.password) this.password = entity.password;

        this.validate(this);
        return this;
    }

    /* Getters & Setters */

    protected get childSchema() {
        return Joi.object({
            username: Joi.string().min(userConstants.minUsernameLength).max(userConstants.maxUsernameLength).required(),
            password: Joi.string().optional(),
        });
    }
}
