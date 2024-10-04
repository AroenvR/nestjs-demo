import { EntityManager } from 'typeorm';

export const mockEntityManager: Partial<EntityManager> = {
	save: jest.fn().mockImplementation((entity) => {
		return entity;
	}),
};
