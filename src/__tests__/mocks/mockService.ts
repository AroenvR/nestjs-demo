// import { ICrudService } from 'src/abstract/ICrudService';
// import { AbstractCrudEntity } from '../../abstract/AbstractCrudEntity';
// import { AbstractUpdateDto } from '../../abstract/AbstractUpdateDto';
// import { AbstractCreateDto } from '../../abstract/AbstractCreateDto';

// /**
//  * Mocks a service with CRUD operations.
//  * @param entity The entity to be used in the service.
//  * @returns A partial service with CRUD operations.
//  */
// export const mockService = (entity: AbstractCrudEntity): Partial<ICrudService<AbstractCrudEntity, AbstractCreateDto, AbstractUpdateDto>> => {
// 	return {
// 		create: jest.fn().mockImplementation(() => {
// 			return { id: 1 };
// 		}),
// 		findAll: jest.fn().mockImplementation(() => {
// 			return [entity];
// 		}),
// 		findOne: jest.fn().mockImplementation((id) => {
// 			entity.id = id;
// 			return entity;
// 		}),
// 		update: jest.fn().mockImplementation((id, _) => {
// 			entity.id = id;
// 			return entity;
// 		}),
// 		remove: jest.fn().mockImplementation(() => {
// 			return undefined;
// 		}),
// 	};
// };
