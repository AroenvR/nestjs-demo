import { Test, TestingModule } from '@nestjs/testing';
import { CreateTemplateDto } from '../../../template/dto/CreateTemplateDto';
import { UpdateTemplateDto } from '../../../template/dto/UpdateTemplateDto';
import { TemplateController } from '../../../template/TemplateController';
import { TemplateService } from '../../../template/TemplateService';
import { LogAdapter } from '../../../logging/LogAdapter';
import { mockLogAdapter, mockILogger } from '../../mocks/logAdapter';
import { TemplateEntity } from '../../../template/entities/TemplateEntity';
import { mockService } from '../../mocks/mockService';

describe('TemplateController Unit', () => {
	let entity: TemplateEntity;
	let controller: TemplateController;

	let className: string;

	beforeEach(async () => {
		entity = new TemplateEntity({ value: 'test' });

		const module: TestingModule = await Test.createTestingModule({
			controllers: [TemplateController],
			providers: [
				{
					useValue: mockService(entity),
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
		await expect(controller.findAll()).resolves.toEqual([entity]);
		expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Finding all entities`, undefined);
	});

	// --------------------------------------------------

	it('Finds an entity by its Id', async () => {
		const id = '1';

		await expect(controller.findOne(id)).resolves.toEqual({ id: id, ...entity });
		expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Finding entity with id ${id}`, undefined);
	});

	// --------------------------------------------------

	it('Updates an entity', async () => {
		const id = '1';
		const dto = new UpdateTemplateDto();
		dto.value = 'tested';

		entity.value = dto.value;

		await expect(controller.update(id, dto)).resolves.toEqual(entity);
		expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Updating entity with id ${id}`, undefined);
	});

	// --------------------------------------------------

	it('Deletes an entity', async () => {
		const id = '1';

		await expect(controller.remove(id)).resolves.toBeUndefined();
		expect(mockILogger.info).toHaveBeenCalledWith(`${className}: Deleting entity with id ${id}`, undefined);
	});
});
