import { Test, TestingModule } from '@nestjs/testing';
import { CreateTemplateDto } from '../../../template/dto/CreateTemplateDto';
import { UpdateTemplateDto } from '../../../template/dto/UpdateTemplateDto';
import { TemplateController } from '../../../template/TemplateController';
import { TemplateService } from '../../../template/TemplateService';
import { LogAdapter } from '../../../logging/LogAdapter';
import { mockLogAdapter, mockILogger } from '../../mocks/logAdapter';

describe('TemplateController Unit', () => {
	let controller: TemplateController;
	let className: string;

	beforeEach(async () => {
		const mockTemplateService = {
			create: jest.fn().mockImplementation(() => {
				return { id: 1 };
			}),
			findAll: jest.fn().mockImplementation(() => {
				return [];
			}),
			findOne: jest.fn().mockImplementation(() => {
				return null;
			}),
			update: jest.fn().mockImplementation(() => {
				return 'Entity by id 1 not found';
			}),
			remove: jest.fn().mockImplementation(() => {
				return undefined;
			}),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [TemplateController],
			providers: [
				{
					useValue: mockTemplateService,
					provide: TemplateService,
				},
				{
					useValue: mockLogAdapter,
					provide: LogAdapter,
				},
			],
		}).compile();

		controller = module.get<TemplateController>(TemplateController);
		className = controller.constructor.name;
	});

	// --------------------------------------------------

	it('Should be defined', () => {
		expect(controller).toBeDefined();
	});

	// --------------------------------------------------

	it('Can create an entity', async () => {
		const dto = new CreateTemplateDto();

		await expect(controller.create(dto)).resolves.toEqual({ id: 1 });
		expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Creating a new entity`, undefined);
	});

	// --------------------------------------------------

	it('Finds all entities', async () => {
		await expect(controller.findAll()).resolves.toEqual([]);
		expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Finding all entities`, undefined);
	});

	// --------------------------------------------------

	it('Finds an entity by its Id', async () => {
		const id = '1';

		await expect(controller.findOne(id)).resolves.toBeNull();
		expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Finding entity with id ${id}`, undefined);
	});

	// --------------------------------------------------

	it('Updates an entity', async () => {
		const id = '1';
		const dto = new UpdateTemplateDto();

		await expect(controller.update(id, dto)).resolves.toEqual('Entity by id 1 not found');
		expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Updating entity with id ${id}`, undefined);
	});

	// --------------------------------------------------

	it('Deletes an entity', async () => {
		const id = '1';

		await expect(controller.remove(id)).resolves.toBeUndefined();
		expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Deleting entity with id ${id}`, undefined);
	});
});
