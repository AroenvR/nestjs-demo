import { randomUUID, UUID } from 'crypto';
import Joi from 'joi';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * This abstract class represents any entity in the database.
 * It provides a few base values and automatic self-validation using a JSON schema upon creation.
 * @column id INTEGER PRIMARY KEY AUTOINCREMENT
 * @column uuid TEXT NOT NULL UNIQUE
 * @column created_at INTEGER NOT NULL
 */
export abstract class AbstractEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'uuid', nullable: false, unique: true })
	uuid: UUID;

	@Column({ name: 'created_at', nullable: false })
	createdAt: number;

	protected constructor(entity: Partial<AbstractEntity>) {
		if (entity) {
			// When adding new values to this AbstractEntity, remember to add it to the parentSchema below.
			this.id = entity.id;
			this.uuid = entity.uuid ?? randomUUID();
			this.createdAt = entity.createdAt ?? Date.now();

			this.validate(entity); // Validate the children.
		}
	}

	/**
	 * Updates the entity with the provided data.
	 * @param entity The data to update the entity with.
	 * @devnote !!! REMEMBER TO CALL **this.validate(this)** at the end of the function !!!
	 */
	protected abstract update(entity: Partial<AbstractEntity>): AbstractEntity;

	/**
	 * Performs a JSON schema validation for the parent's base values and the child's own values.
	 * @throws ValidationError if either the parent or the child's JSON schemas fail.
	 * @devnote This needs to be manually implemented in the child's `update` function.
	 */
	protected validate(entity: Partial<AbstractEntity>): void {
		this.validateParent();
		this.validateChild(entity);
	}

	/**
	 * Execute a JSON schema validation for the parent's schema.
	 * @devnote Check the {@link parentSchema} getter for more info.
	 */
	private validateParent(): void {
		const { error } = this.parentSchema.strict().validate(this, { abortEarly: false, allowUnknown: true });
		if (error) throw new Error(`${this.constructor.name}: Parent's JSON schema validation failed: ${this.generateJsonSchemaErrorMessage(error)}`);
	}

	/**
	 * Execute a JSON schema validation on the child's incoming data.
	 * @param entity The child's incoming data to validate.
	 * @devnote Check the {@link childSchema} getter for more info.
	 */
	private validateChild(entity: Partial<AbstractEntity>): void {
		const { error } = Joi.alternatives() // Allow either a full parent+child schema or a child-only schema.
			.try(this.parentSchema.concat(this.childSchema), this.childSchema)
			.strict()
			.validate(entity, { abortEarly: false, allowUnknown: false });

		if (error) throw new Error(`${this.constructor.name}: Child's JSON schema validation failed: ${this.generateJsonSchemaErrorMessage(error)}`);
	}

	/**
	 * Generate a detailed error message from a Joi ValidationError.
	 * @param error The Joi ValidationError to generate a message from.
	 */
	private generateJsonSchemaErrorMessage(error: Joi.ValidationError): string {
		let message = error.message;

		const disallowedKeys: string[] = [];
		if (error.details) {
			for (const detail of error.details) {
				const value = detail.context?.value;

				if (detail.context && value && typeof value === 'object') {
					const keys = Object.keys(value);
					disallowedKeys.push(...keys);
				}
			}
		}

		if (disallowedKeys.length >= 1) message += ` - Problematic keys: ${disallowedKeys.join(', ')}`;
		return message;
	}

	/* Getters & Setters */

	/**
	 * The child's JSON schema which will be used for auto-validation.
	 * This only needs to include the child's own values.
	 * Inherited values can be skipped.
	 */
	protected abstract get childSchema(): Joi.ObjectSchema;

	/**
	 * The parent's JSON schema.
	 */
	private get parentSchema(): Joi.ObjectSchema {
		return Joi.object({
			id: Joi.number().integer().positive().optional(), // Optional since a new entity might not have an ID yet.
			uuid: Joi.string().uuid({ version: 'uuidv4' }).required(),
			createdAt: Joi.number().integer().positive().required(),
		});
	}
}
