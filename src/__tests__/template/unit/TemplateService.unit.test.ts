import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager, Repository } from 'typeorm';
import { TemplateService } from '../../../template/TemplateService';
import { CreateTemplateDto } from '../../../template/dto/CreateTemplateDto';
import { UpdateTemplateDto } from '../../../template/dto/UpdateTemplateDto';
import { TemplateEntity } from '../../../template/entities/TemplateEntity';
import { mockILogger, mockLogAdapter } from '../../mocks/logAdapter';
import { LogAdapter } from '../../../logging/LogAdapter';
import { mockEntityManager } from '../../mocks/entityManager';

describe('TemplateService Unit', () => {
	let service: TemplateService;
	let mockTemplateRepository: Partial<Repository<TemplateEntity>>;

	let className: string;

	beforeEach(async () => {
		mockTemplateRepository = {
			find: jest.fn().mockImplementation(() => {
				return [];
			}),
			findOne: jest.fn().mockImplementation((id) => {
				if (id === 1) {
					return { id: 1 };
				}
				return null;
			}),
			remove: jest.fn().mockImplementation((id) => {
				if (id === 1) {
					return;
				}
				throw new Error('Entity not found');
			}),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TemplateService,
				{
					useValue: mockLogAdapter,
					provide: LogAdapter,
				},
				{
					provide: 'TemplateEntityRepository',
					useValue: mockTemplateRepository,
				},
				{
					provide: EntityManager,
					useValue: mockEntityManager,
				},
			],
		}).compile();

		service = module.get<TemplateService>(TemplateService);
		className = service.constructor.name;
	});

	// --------------------------------------------------

	it('Should be defined', () => {
		expect(service).toBeDefined();
	});

	// --------------------------------------------------

	it('Can create an entity', async () => {
		const dto = new CreateTemplateDto();

		await expect(service.create(dto)).rejects.toThrow('Method not implemented');
		expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Creating a new entity`, undefined);
	});

	// --------------------------------------------------

	it('Finds all entities', async () => {
		await expect(service.findAll()).rejects.toThrow('Method not implemented');
		expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Finding all entities`, undefined);
	});

	// --------------------------------------------------

	it('Finds an entity by its Id', async () => {
		const id = 1;

		await expect(service.findOne(id)).rejects.toThrow('Method not implemented');
		expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Finding entity with id ${id}`, undefined);
	});

	// --------------------------------------------------

	it('Updates an entity', async () => {
		const id = 1;
		const dto = new UpdateTemplateDto();

		await expect(service.update(id, dto)).rejects.toThrow('Method not implemented');
		expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Updating entity with id ${id}`, undefined);
	});

	// --------------------------------------------------

	it('Deletes an entity', async () => {
		const id = 1;

		await expect(service.remove(id)).rejects.toThrow('Method not implemented');
		expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Deleting entity with id ${id}`, undefined);
	});
});
