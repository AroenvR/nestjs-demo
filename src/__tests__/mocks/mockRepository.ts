// import { AbstractCrudEntity } from 'src/abstract/AbstractCrudEntity';
// import { AbstractEntity } from 'src/domain/entities/AbstractEntity';
// import { Repository } from 'typeorm';

// /**
//  * Mocks a repository with CRUD operations.
//  * @param entity The entity to be used in the repository.
//  * @returns A partial repository with CRUD operations.
//  */
// export const mockRepository = <T extends AbstractEntity>(entity: Partial<T>): Partial<Repository<T>> => {
// 	return {
// 		find: jest.fn().mockImplementation(() => {
// 			return [entity];
// 		}),
// 		findOneBy: jest.fn().mockImplementation((entity: Partial<AbstractEntity>) => {
// 			if (entity.id === 69) return null;

// 			// return entity.(entity);
// 		}),
// 		delete: jest.fn().mockImplementation((_) => {
// 			return undefined;
// 		}),
// 	};
// };
