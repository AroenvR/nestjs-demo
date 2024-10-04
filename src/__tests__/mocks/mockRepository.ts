import { AbstractCrudEntity } from 'src/abstract/AbstractCrudEntity';
import { Repository } from 'typeorm';

/**
 * Mocks a repository with CRUD operations.
 * @param entity The entity to be used in the repository.
 * @returns A partial repository with CRUD operations.
 */
export const mockRepository = <T extends AbstractCrudEntity>(entity: Partial<T>): Partial<Repository<T>> => {
	return {
		find: jest.fn().mockImplementation(() => {
			return [entity];
		}),
		findOneBy: jest.fn().mockImplementation(({ id }) => {
			if (id === 69) return null;

			entity.id = id;
			return entity;
		}),
		delete: jest.fn().mockImplementation((_) => {
			return undefined;
		}),
	};
};
