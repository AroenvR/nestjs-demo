import Joi from 'joi';
import { AbstractEntity } from './AbstractEntity';
import { randomUUID } from 'crypto';

/**
 * Mock Entity to test the {@link AbstractEntity}'s functionality.
 * @extends AbstractEntity
 */
class MockEntity extends AbstractEntity {
	username: string;

	constructor(entity: Partial<MockEntity>) {
		super(entity);

		if (entity) this.username = entity.username;
	}

	/**
	 *
	 */
	public update(entity: Partial<MockEntity>): MockEntity {
		if (entity.username) this.username = entity.username;

		this.validate(this);
		return this;
	}

	/* Getters & Setters */

	protected get childSchema() {
		return Joi.object({
			username: Joi.string().min(3).required(),
		});
	}
}

describe('AbstractEntity', () => {
	const ID = 1;
	const UUID = randomUUID();
	const CREATED_AT = Date.now();
	const USERNAME = 'John Doe';

	describe('Happy flow', () => {
		it('Can create and validate children using a static factory with maximal values', () => {
			const entity = new MockEntity({ id: ID, uuid: UUID, createdAt: CREATED_AT, username: USERNAME });

			expect(entity).toBeInstanceOf(MockEntity);
			expect(entity.id).toEqual(ID);
			expect(entity.uuid).toEqual(UUID);
			expect(entity.createdAt).toEqual(CREATED_AT);
			expect(entity.username).toEqual(USERNAME);
		});

		// --------------------------------------------------

		it('Can create and validate children using a static factory with minimal values', () => {
			const entity = new MockEntity({ username: USERNAME });

			expect(entity).toBeInstanceOf(MockEntity);

			expect(entity.id).toBeUndefined();

			expect(entity.uuid).toBeTruthy();
			expect(typeof entity.uuid).toBe('string');

			expect(entity.createdAt).toBeTruthy();
			expect(typeof entity.createdAt).toBe('number');

			expect(entity.username).toEqual(USERNAME);
		});

		// --------------------------------------------------

		it('Allows children to update their values', () => {
			const UPDATED_VALUE = 'Jane Doe';

			const maximalEntity = new MockEntity({ id: ID, uuid: UUID, createdAt: CREATED_AT, username: USERNAME });
			maximalEntity.update({ username: UPDATED_VALUE });

			expect(maximalEntity).toBeInstanceOf(MockEntity);
			expect(maximalEntity.username).toEqual(UPDATED_VALUE);

			// ---

			const minimalEntity = new MockEntity({ username: USERNAME });
			minimalEntity.update({ username: UPDATED_VALUE });

			expect(minimalEntity).toBeInstanceOf(MockEntity);
			expect(minimalEntity.username).toEqual(UPDATED_VALUE);
		});
	});

	// --------------------------------------------------

	describe('Errors', () => {
		it('Throws for unexpected values', () => {
			// @ts-expect-error: Create method / constructor don't accept unknown values
			expect(() => new MockEntity({ malicious: USERNAME, injection: 'SELECT *' })).toThrow('Disallowed keys: malicious, injection');
		});

		// --------------------------------------------------

		it("Throws when the parent's schema fails", () => {
			// @ts-expect-error: ID value must be a number
			expect(() => new MockEntity({ id: 'YOLO' })).toThrow('JSON schema validation failed: "id" must be a number');
		});
	});
});
