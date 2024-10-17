import { ICrudService } from 'src/abstract/ICrudService';
import { AbstractCrudService } from '../../abstract/AbstractCrudService';
import { mockEntityManager } from '../mocks/mockEntityManager';
import { mockLogAdapter } from '../mocks/mockLogAdapter';
import { mockRepository } from '../mocks/mockRepository';
import { AbstractUpdateDto } from '../../abstract/AbstractUpdateDto';
import { AbstractCreateDto } from '../../abstract/AbstractCreateDto';
import { AbstractCrudEntity } from '../../abstract/AbstractCrudEntity';

/* @Security: This service should always throw so functional endpoints can't be accidentally created */

describe('AbstractService', () => {
	let service: ICrudService<AbstractCrudEntity, AbstractCreateDto, AbstractUpdateDto>;

	beforeEach(() => {
		const repository = mockRepository({});
		const entityManager = mockEntityManager;
		const logAdapter = mockLogAdapter;

		// @ts-expect-error --- This is intentional
		service = new AbstractCrudService(repository, entityManager, logAdapter);
	});

	// --------------------------------------------------

	test('Throws when requested to create', async () => {
		await expect(service.create({})).rejects.toThrow('AbstractCrudService: Abstract method not implemented');
	});

	// --------------------------------------------------

	test('Throws when requested to find all', async () => {
		await expect(service.findAll()).rejects.toThrow('AbstractCrudService: Abstract method not implemented');
	});

	// --------------------------------------------------

	test('Throws when requested to find by id', async () => {
		await expect(service.findOne(1)).rejects.toThrow('AbstractCrudService: Abstract method not implemented');
	});

	// --------------------------------------------------

	test('Throws when requested to update by id', async () => {
		await expect(service.update(1, {})).rejects.toThrow('AbstractCrudService: Abstract method not implemented');
	});

	// --------------------------------------------------

	test('Throws when requested to delete by id', async () => {
		await expect(service.remove(1)).rejects.toThrow('AbstractCrudService: Abstract method not implemented');
	});
});
