import Joi from 'joi';
import { Entity, Column } from 'typeorm';
import { AbstractEntity } from '../AbstractEntity';
import { UUID } from 'crypto';

/**
 * Represents a Session entity in the database.
 * @Column
 */
@Entity()
export class SessionEntity extends AbstractEntity {
    @Column({ nullable: false })
    jwt: string;

    @Column({ nullable: false })
    userUuid: UUID;

    @Column({ nullable: false })
    expiresAt: Date;

    constructor(entity: Partial<SessionEntity>) {
        super(entity);

        if (entity) {
            this.jwt = entity.jwt;
            this.userUuid = entity.userUuid;
            this.expiresAt = entity.expiresAt;
        }
    }

    /**
     *
     */
    public static create(data: Partial<SessionEntity> | CreateSessionDto) {
        const parentData = SessionEntity.parentDataHolder(data);

        const dataHolder: Partial<SessionEntity> = {
            ...parentData,
            ...data,
        }

        return new SessionEntity(dataHolder);
    }

    /**
     *
     */
    public update(entity: Partial<SessionEntity> | UpdateSessionDto) {
        if (entity.jwt) this.jwt = entity.jwt;
        if (entity.userUuid) this.userUuid = entity.userUuid;
        if (entity.expiresAt) this.expiresAt = entity.expiresAt;
        if (entity.refreshToken) this.refreshToken = entity.refreshToken;

        this.validate(this);
        return this;
    }

    /* Getters & Setters */

    protected get childSchema() {
        return Joi.object({

        });
    }
}