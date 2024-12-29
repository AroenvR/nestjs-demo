import { AbstractEntity } from '../../../domain/AbstractEntity';

/**
 * Mocks a repository with CRUD operations.
 */
export class MockRepository<Entity extends AbstractEntity> {
	constructor(private createEntity: () => Entity) {}

	find = jest.fn().mockResolvedValue([this.createEntity()]);

	findOneBy = jest.fn().mockImplementation((criteria: Partial<Entity>) => {
		if (criteria.id === 69) return null; // To test the error handling

		return this.createEntity();
	});

	delete = jest.fn().mockImplementation((_) => {
		return undefined;
	});
}
