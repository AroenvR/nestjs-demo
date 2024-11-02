import { AbstractEntity } from '../../../domain/entities/AbstractEntity';

/**
 * Mocks a transaction manager with CRUD operations.
 */
export class MockEntityManager<T extends AbstractEntity> {
	save = jest.fn().mockImplementation((entity: T) => {
		if (entity.id === 69) return null; // To test the error handling

		entity.id = 1;
		return entity;
	});

	transaction = jest.fn().mockImplementation((callback: (manager: MockEntityManager<T>) => Promise<T>) => {
		return callback(this);
	});
}
