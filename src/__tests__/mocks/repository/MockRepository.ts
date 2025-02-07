import { AbstractEntity } from '../../../domain/AbstractEntity';

/**
 * Criteria to execute a FindOne query.
 */
type TFindOneQuery = {
	where: Record<string, string | number>;
	relations: string[];
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

	findOne = jest.fn().mockImplementation((query: TFindOneQuery) => {
		if (query.where.id === 69) return null; // To test the error handling

		return this.createEntity();
	});

	findOneBy = jest.fn().mockImplementation((criteria: Partial<Entity>) => {
		if (criteria.id === 69) return null; // To test the error handling

		return this.createEntity();
	});

	delete = jest.fn().mockImplementation((_) => {
		return undefined;
	});
}
