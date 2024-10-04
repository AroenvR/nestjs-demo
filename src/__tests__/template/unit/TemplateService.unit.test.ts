import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
import { TemplateService } from '../../../template/TemplateService';
import { CreateTemplateDto } from '../../../template/dto/CreateTemplateDto';
import { UpdateTemplateDto } from '../../../template/dto/UpdateTemplateDto';
import { TemplateEntity } from '../../../template/entities/TemplateEntity';
import { mockILogger, mockLogAdapter } from '../../mocks/mockLogAdapter';
import { LogAdapter } from '../../../logging/LogAdapter';
import { mockEntityManager } from '../../mocks/mockEntityManager';
import { mockRepository } from '../../mocks/mockRepository';
import { AbstractService } from 'src/abstract/AbstractService';

describe('TemplateService Unit', () => {
	// Value to change
	let entity: TemplateEntity; // Value to change
	let service: AbstractService;

	let className: string;

	beforeEach(async () => {
		entity = new TemplateEntity({ value: 'test' }); // Value to change

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TemplateService, // Value to change
				{
					useValue: mockLogAdapter,
					provide: LogAdapter,
				},
				{
					provide: `${entity.constructor.name}Repository`,
					useValue: mockRepository(entity),
				},
				{
					provide: EntityManager,
					useValue: mockEntityManager,
				},
			],
		}).compile();

		service = module.get<TemplateService>(TemplateService); // Value to change
		className = service.constructor.name;
	});

	// --------------------------------------------------

	it('Should be defined', () => {
		expect(service).toBeDefined();
	});

	// --------------------------------------------------

	it('Can create an entity', async () => {
		const dto = new CreateTemplateDto(); // Value to change
		dto.value = entity.value; // Value to change

		await expect(service.create(dto)).resolves.toEqual(entity);
		expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Creating a new entity`, undefined);
	});

	// --------------------------------------------------

	it('Finds all entities', async () => {
		await expect(service.findAll()).resolves.toEqual([entity]);
		expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Finding all entities`, undefined);
	});

	// --------------------------------------------------

	it('Finds an entity by its id', async () => {
		const id = 1;

		await expect(service.findOne(id)).resolves.toEqual({ id: id, ...entity }); // Value to change
		expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Finding entity with id ${id}`, undefined);
	});

	// --------------------------------------------------

	it('Throws when unable to find an entity by its id', async () => {
		const id = 69;

		await expect(service.findOne(id)).rejects.toThrow(`Entity by id ${id} not found`);
		expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Finding entity with id ${id}`, undefined);
	});

	// --------------------------------------------------

	it('Updates an entity', async () => {
		const id = 1;

		const dto = new UpdateTemplateDto(); // Value to change
		dto.value = 'tested'; // Value to change

		entity.value = dto.value; // Value to change

		await expect(service.update(id, dto)).resolves.toEqual(entity);
		expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Updating entity with id ${id}`, undefined);
	});

	// --------------------------------------------------

	it('Throws when unable to find an entity to update by its id', async () => {
		const id = 69;
		const dto = new UpdateTemplateDto(); // Value to change
		dto.value = 'tested'; // Value to change

		entity.value = dto.value; // Value to change

		await expect(service.update(id, dto)).rejects.toThrow(`Entity by id ${id} not found`);
		expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Finding entity with id ${id}`, undefined);
	});

	// --------------------------------------------------

	it('Deletes an entity', async () => {
		const id = 1;

		await expect(service.remove(id)).resolves.toBeUndefined();
		expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Deleting entity with id ${id}`, undefined);
	});

	// --------------------------------------------------

	it('Throws when unable to find an entity to delete by its id', async () => {
		const id = 69;

		await expect(service.remove(id)).rejects.toThrow(`Entity by id ${id} not found`);
		expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Finding entity with id ${id}`, undefined);
	});
});
