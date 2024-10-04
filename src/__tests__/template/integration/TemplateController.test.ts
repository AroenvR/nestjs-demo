import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateController } from '../../../template/TemplateController';
import { LoggerModule } from '../../../logging/LoggerModule';
import { TemplateService } from '../../../template/TemplateService';
import { CreateTemplateDto } from '../../../template/dto/CreateTemplateDto';
import { UpdateTemplateDto } from '../../../template/dto/UpdateTemplateDto';
import { TemplateEntity } from '../../../template/entities/TemplateEntity';
import { DatabaseModule } from '../../../database/DatabaseModule';
import { wasLogged } from '../../helpers/wasLogged';

describe('TemplateController Integration', () => {
	const testName = 'TemplateController_Integration';
	process.env.TEST_NAME = testName; // Creates a log file named with this test's name.

	let controller: TemplateController;
	let className: string;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [LoggerModule, DatabaseModule, TypeOrmModule.forFeature([TemplateEntity])],
			controllers: [TemplateController],
			providers: [TemplateService],
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

		await expect(controller.create(dto)).rejects.toThrow('Method not implemented');
		await expect(wasLogged(testName, `${className}: Creating a new entity`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Finds all entities', async () => {
		await expect(controller.findAll()).rejects.toThrow('Method not implemented');
		await expect(wasLogged(testName, `${className}: Finding all entities`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Finds an entity by its Id', async () => {
		const id = '1';

		await expect(controller.findOne(id)).rejects.toThrow('Method not implemented');
		await expect(wasLogged(testName, `${className}: Finding entity with id ${id}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Updates an entity', async () => {
		const id = '1';
		const dto = new UpdateTemplateDto();

		await expect(controller.update(id, dto)).rejects.toThrow('Method not implemented');
		await expect(wasLogged(testName, `${className}: Updating entity with id ${id}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Deletes an entity', async () => {
		const id = '1';

		await expect(controller.remove(id)).rejects.toThrow('Method not implemented');
		await expect(wasLogged(testName, `${className}: Deleting entity with id ${id}`)).resolves.toBe(true);
	});
});
