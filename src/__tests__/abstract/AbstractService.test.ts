import { AbstractCrudService } from '../../abstract/AbstractCrudService';
import { mockEntityManager } from '../mocks/mockEntityManager';
import { mockLogAdapter } from '../mocks/mockLogAdapter';
import { mockRepository } from '../mocks/mockRepository';

/* @Security: This service should always throw so functional endpoints can't be accidentally created */

describe('AbstractService', () => {
	let service: AbstractCrudService;

	beforeEach(() => {
		const repository = mockRepository({});
		const entityManager = mockEntityManager;
		const logAdapter = mockLogAdapter;

		// @ts-expect-error --- This is intentional
		service = new AbstractCrudService(repository, entityManager, logAdapter);
	});

	// --------------------------------------------------

	test('Throws when requested to create', async () => {
		await expect(service.create({})).rejects.toThrow('Method not implemented');
	});

	// --------------------------------------------------

	test('Throws when requested to find all', async () => {
		await expect(service.findAll()).rejects.toThrow('Method not implemented');
	});

	// --------------------------------------------------

	test('Throws when requested to find by id', async () => {
		await expect(service.findOne(1)).rejects.toThrow('Method not implemented');
	});

	// --------------------------------------------------

	test('Throws when requested to update by id', async () => {
		await expect(service.update(1, {})).rejects.toThrow('Method not implemented');
	});

	// --------------------------------------------------

	test('Throws when requested to delete by id', async () => {
		await expect(service.remove(1)).rejects.toThrow('Method not implemented');
	});
});
