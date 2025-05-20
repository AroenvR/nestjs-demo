import Joi from "joi";
import { randomUUID } from "crypto";
import { NotImplementedException } from "@nestjs/common";
import { AbstractEntity } from "./AbstractEntity";
import { falsyValues } from "../__tests__/helpers/falsyValues";

/**
 * Mock Entity to test the {@link AbstractEntity}'s throwing on an unimplemented 'create' function.
 */
class MockEntityWithoutCreate extends AbstractEntity {
	public update(_: unknown) {
		return this;
	}

	protected get childSchema() {
		return Joi.object({});
	}
}

/**
 * Mock Entity to test the {@link AbstractEntity}'s functionality.
 * @extends AbstractEntity
 */
class MockEntity extends AbstractEntity {
	data: string;

	protected constructor(entity: Partial<MockEntity>) {
		super(entity);

		if (entity) this.data = entity.data;
	}

	/**
	 *
	 */
	public static create(entity: Partial<MockEntity>): MockEntity {
		return new MockEntity(entity);
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

describe("AbstractEntity", () => {
	const ID = 1;
	const UUID = randomUUID();
	const CREATED_AT = Date.now();
	const DATA = "Foobar";

	describe("Happy flow", () => {
		it("Can create and validate children with maximal values", () => {
			const entity = MockEntity.create({ id: ID, uuid: UUID, createdAt: CREATED_AT, data: DATA });

			expect(entity).toBeInstanceOf(MockEntity);
			expect(entity.id).toEqual(ID);
			expect(entity.uuid).toEqual(UUID);
			expect(entity.createdAt).toEqual(CREATED_AT);
			expect(entity.data).toEqual(DATA);
		});

		// --------------------------------------------------

		it("Can create and validate children with minimal values", () => {
			const entity = MockEntity.create({ data: DATA });

			expect(entity).toBeInstanceOf(MockEntity);
			expect(entity.id).toBeUndefined();
			expect(entity.uuid).toBeTruthy();
			expect(typeof entity.uuid).toBe("string");
			expect(entity.createdAt).toBeTruthy();
			expect(typeof entity.createdAt).toBe("number");

			expect(entity.data).toEqual(DATA);
		});

		// --------------------------------------------------

		it("Allows children to update their values", () => {
			const UPDATED_VALUE = "Bazqux";

			const maximalEntity = MockEntity.create({ id: ID, uuid: UUID, createdAt: CREATED_AT, data: DATA });
			maximalEntity.update({ data: UPDATED_VALUE });

			expect(maximalEntity).toBeInstanceOf(MockEntity);
			expect(maximalEntity.data).toEqual(UPDATED_VALUE);

			// ---

			const minimalEntity = MockEntity.create({ data: DATA });
			minimalEntity.update({ data: UPDATED_VALUE });

			expect(minimalEntity).toBeInstanceOf(MockEntity);
			expect(minimalEntity.data).toEqual(UPDATED_VALUE);
		});
	});

	// --------------------------------------------------

	describe("Errors", () => {
		it("Throws for unexpected values", () => {
			try {
				// @ts-expect-error: Create method / constructor don't accept unknown values
				MockEntity.create({ malicious: DATA, injection: "SELECT *" });
			} catch (err) {
				expect(err.message).toContain("JSON schema validation failed");
				expect(err.message).toContain("malicious");
				expect(err.message).toContain("injection");
			}
		});

		// --------------------------------------------------

		it("Throws when the parent/child schemas fail", () => {
			const captureAndValdiate = (data: unknown) => {
				try {
					MockEntity.create(data);
					fail("Expected an error to be thrown");
				} catch (err) {
					// Both the parent and the child's schemas fail on these values. Object.keys(data)[0] is used to verify the error message is accurate.
					if (err.message.includes("Parent")) expect(err.message).toContain(`Parent's JSON schema validation failed`);
					else if (err.message.includes("Child")) expect(err.message).toContain(`Child's JSON schema validation failed`);
					else fail("Unexpected error message received");
				}
			};

			for (const value of falsyValues()) {
				captureAndValdiate({ id: value });
				captureAndValdiate({ uuid: value });
				captureAndValdiate({ createdAt: value });
			}
		});

		// --------------------------------------------------

		it("Throws when given null", () => {
			expect(() => MockEntity.create(null)).toThrow(Error);
		});

		// --------------------------------------------------

		it("Throws when the static 'create' factory is not implemented", () => {
			expect(() => MockEntityWithoutCreate.create({})).toThrow(NotImplementedException);
		});
	});
});
