import Joi from "joi";
import { UUID } from "crypto";
import { Entity, Column } from "typeorm";
import { BadRequestException } from "@nestjs/common";
import { AbstractEntity } from "../AbstractEntity";
import { ApplicationEntities } from "../../common/enums/ApplicationEntities";

/**
 * Represents a refresh token entity in the database.
 * @Column jti TEXT NOT NULL UNIQUE
 * @Column sub TEXT NOT NULL
 * @Column hash TEXT NOT NULL UNIQUE
 * @Column last_refreshed_at INTEGER NOT NULL
 */
@Entity(ApplicationEntities.REFRESH_TOKEN)
export class RefreshTokenEntity extends AbstractEntity {
	@Column({ nullable: false, unique: true })
	jti: UUID;

	@Column({ nullable: false })
	sub: UUID;

	@Column({ nullable: false, unique: true })
	hash: string;

	@Column({ nullable: false })
	lastRefreshedAt: number;

	constructor(entity: Partial<RefreshTokenEntity>) {
		super(entity);

		if (entity) {
			this.jti = entity.jti;
			this.sub = entity.sub;
			this.hash = entity.hash;
			this.lastRefreshedAt = entity.lastRefreshedAt;
		}
	}

	/**
	 *
	 */
	public static create(data: Partial<RefreshTokenEntity>) {
		const parentData = RefreshTokenEntity.parentDataHolder(data);

		const dataHolder: Partial<RefreshTokenEntity> = {
			lastRefreshedAt: Date.now(),
			...parentData,
			...data,
		};

		return new RefreshTokenEntity(dataHolder);
	}

	/**
	 * Updates the user's HTTP-Only Cookie's state.
	 * Increments the refresh count and validates the RefreshToken.
	 * @param hash The new hash to set
	 * @returns The updated RefreshTokenEntity
	 */
	public refresh(jti: UUID, hash: string, cookieExpiry: number, tokenExpiry: number) {
		const expired = Date.now() - this.createdAt > cookieExpiry;
		if (expired) throw new BadRequestException("Cookie has expired.");

		const refreshThrottle = Date.now() - this.lastRefreshedAt < tokenExpiry;
		if (refreshThrottle) throw new BadRequestException("Refreshing too soon.");

		this.jti = jti; // TODO: Assert this is a valid JTI?
		this.hash = hash; // TODO: Assert this is a valid checksum?
		this.lastRefreshedAt = Date.now();

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
			jti: Joi.string().uuid({ version: "uuidv4" }).required(),
			sub: Joi.string().uuid({ version: "uuidv4" }).required(),
			hash: Joi.string().min(44).required(),
			lastRefreshedAt: Joi.number().required(),
		});
	}
}
