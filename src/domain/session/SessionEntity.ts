import Joi from 'joi';
import { UUID } from 'crypto';
import { Entity, Column } from 'typeorm';
import { AbstractEntity } from '../AbstractEntity';
import { sessionConstants } from '../../common/constants/sessionConstants';

/**
 * Represents a Session entity in the database.
 * @Column userUuid TEXT NOT NULL UNIQUE
 * @Column longLivedJwt TEXT NOT NULL UNIQUE
 * @Column refreshes INTEGER NOT NULL DEFAULT 0
 */
@Entity()
export class SessionEntity extends AbstractEntity {
	@Column({ nullable: false, unique: true })
	userUuid: UUID;

	@Column({ nullable: false, unique: true })
	longLivedJwt: string;

	@Column({ nullable: false, default: 0 })
	refreshes: number;

	constructor(entity: Partial<SessionEntity>) {
		super(entity);

		if (entity) {
			this.userUuid = entity.userUuid;
			this.longLivedJwt = entity.longLivedJwt;
			this.refreshes = entity.refreshes ?? 0;
		}
	}

	/**
	 *
	 */
	public static create(data: Partial<SessionEntity>) {
		const parentData = SessionEntity.parentDataHolder(data);

		const dataHolder: Partial<SessionEntity> = {
			...parentData,
			...data,
		};

		return new SessionEntity(dataHolder);
	}

	/**
	 * Refreshes the JWT for the user's session.
	 * Increments the refresh count and validates the session.
	 * @param jwt The new JWT to set
	 * @returns The updated SessionEntity
	 */
	public refreshJwt(jwt: string) {
		this.longLivedJwt = jwt;
		this.refreshes++;

		if (this.refreshes > sessionConstants.maxRefreshes) {
			throw new Error('Max refreshes exceeded');
		}

		this.validate(this);
		return this;
	}

	/**
	 *
	 */
	public update(_: unknown) {
		throw new Error(`${this.constructor.name}: Updating is not allowed.`);
		return this; // Return statement is required to satisfy TypeScript
	}

	/* Getters & Setters */

	protected get childSchema() {
		return Joi.object({
			userUuid: Joi.string().uuid({ version: 'uuidv4' }).required(),
			longLivedJwt: Joi.string().required(),
			refreshes: Joi.number().integer().min(0).max(sessionConstants.maxRefreshes).default(0).required(),
		});
	}
}
