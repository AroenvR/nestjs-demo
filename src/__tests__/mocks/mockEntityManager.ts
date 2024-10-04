import { EntityManager } from 'typeorm';

/**
 * Mocks an EntityManager with a save method.
 */
export const mockEntityManager: Partial<EntityManager> = {
	save: jest.fn().mockImplementation((entity) => {
		return entity;
	}),
};
