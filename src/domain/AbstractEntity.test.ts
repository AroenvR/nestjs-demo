import Joi from 'joi';
import { AbstractEntity } from './AbstractEntity';
import { randomUUID } from 'crypto';

/**
 * Mock Entity to test the {@link AbstractEntity}'s functionality.
 * @extends AbstractEntity
 */
class MockEntity extends AbstractEntity {
	data: string;

	constructor(entity: Partial<MockEntity>) {
		super(entity);

		if (entity) this.data = entity.data;
	}

	/**
	 *
	 */
	public update(entity: Partial<MockEntity>): MockEntity {
		if (entity.data) this.data = entity.data;

		this.validate(this);
		return this;
	}

	/* Getters & Setters */

	protected get childSchema() {
		return Joi.object({
			data: Joi.string().min(3).required(),
		});
	}
}

describe('AbstractEntity', () => {
	const ID = 1;
	const UUID = randomUUID();
	const CREATED_AT = Date.now();
	const DATA = 'Foobar';

	describe('Happy flow', () => {
		it('Can create and validate children with maximal values', () => {
			const entity = new MockEntity({ id: ID, uuid: UUID, createdAt: CREATED_AT, data: DATA });

			expect(entity).toBeInstanceOf(MockEntity);
			expect(entity.id).toEqual(ID);
			expect(entity.uuid).toEqual(UUID);
			expect(entity.createdAt).toEqual(CREATED_AT);
			expect(entity.data).toEqual(DATA);
		});

		// --------------------------------------------------

		it('Can create and validate children with minimal values', () => {
			const entity = new MockEntity({ data: DATA });

			expect(entity).toBeInstanceOf(MockEntity);
			expect(entity.id).toBeUndefined();
			expect(entity.uuid).toBeTruthy();
			expect(typeof entity.uuid).toBe('string');
			expect(entity.createdAt).toBeTruthy();
			expect(typeof entity.createdAt).toBe('number');

			expect(entity.data).toEqual(DATA);
		});

		// --------------------------------------------------

		it('Allows children to update their values', () => {
			const UPDATED_VALUE = 'Bazqux';

			const maximalEntity = new MockEntity({ id: ID, uuid: UUID, createdAt: CREATED_AT, data: DATA });
			maximalEntity.update({ data: UPDATED_VALUE });

			expect(maximalEntity).toBeInstanceOf(MockEntity);
			expect(maximalEntity.data).toEqual(UPDATED_VALUE);

			// ---

			const minimalEntity = new MockEntity({ data: DATA });
			minimalEntity.update({ data: UPDATED_VALUE });

			expect(minimalEntity).toBeInstanceOf(MockEntity);
			expect(minimalEntity.data).toEqual(UPDATED_VALUE);
		});
	});

	// --------------------------------------------------

	describe('Errors', () => {
		it('Throws for unexpected values', () => {
			// @ts-expect-error: Create method / constructor don't accept unknown values
			expect(() => new MockEntity({ malicious: DATA, injection: 'SELECT *' })).toThrow('Problematic keys: malicious, injection');
		});

		// --------------------------------------------------

		it('Throws when the parent/child schemas fail', () => {
			const values: unknown[] = [null, undefined, '', 0, -100, true, false, [], {}, Symbol('yolo')];

			const captureAndValdiate = (data: unknown) => {
				try {
					new MockEntity(data);
					fail('Expected an error to be thrown');
				} catch (err) {
					// Both the parent and the child's schemas fail on these values. Object.keys(data)[0] is used to verify the error message is accurate.
					if (err.message.includes('Parent'))
						expect(err.message).toContain(`Parent's JSON schema validation failed: \"${Object.keys(data)[0]}\"`);
					else if (err.message.includes('Child'))
						expect(err.message).toContain(
							`Child's JSON schema validation failed: \"value\" does not match any of the allowed types - Problematic keys: ${Object.keys(data)[0]}`,
						);
					else fail('Unexpected error message received');
				}
			};

			for (const value of values) {
				captureAndValdiate({ id: value });
				captureAndValdiate({ uuid: value });
				captureAndValdiate({ createdAt: value });
			}
		});
	});
});
