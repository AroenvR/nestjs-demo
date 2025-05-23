import { AbstractEntity } from "../../../domain/AbstractEntity";

export const MOCK_BAD_UUID = "167ad25f-0f91-4ac0-a9ed-99cef801ba9e";

/**
 * Criteria to execute a FindOne query.
 */
type TFindOneQuery = {
	where: Record<string, string | number>;
	relations: string[];
};

type TFindManyQuery = {
	id: { _value: number[] };
};

/**
 * Mocks a repository with CRUD operations.
 */
export class MockRepository<Entity extends AbstractEntity> {
	constructor(private createEntity: () => Entity) {}

	count = jest.fn().mockResolvedValue(0);

	save = jest.fn().mockResolvedValue((data: unknown) => {
		return data;
	});

	find = jest.fn().mockResolvedValue([this.createEntity()]);

	findBy = jest.fn().mockResolvedValue((query: TFindManyQuery) => {
		if (query.id._value.length === 0) return [];

		return [this.createEntity()];
	});

	findOne = jest.fn().mockImplementation((query: TFindOneQuery) => {
		if (query.where.id === 69) return null; // To test the error handling
		if (query.where.uuid === MOCK_BAD_UUID) return null; // To test the error handling

		return this.createEntity();
	});

	findOneBy = jest.fn().mockImplementation((criteria: Partial<Entity>) => {
		if (criteria.id === 69) return null; // To test the error handling

		return this.createEntity();
	});

	remove = jest.fn().mockImplementation((_) => {
		return null;
	});
}
