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
import { AbstractCrudController } from 'src/abstract/AbstractCrudController';
// import { AuthModule } from '../../../auth/AuthModule';

// Value to change
describe('TemplateController Integration', () => {
	const testName = 'TemplateController_Integration'; // Value to change
	process.env.TEST_NAME = testName; // Creates a log file named with this test's name.

	let controller: AbstractCrudController;
	let className: string;

	const id = 1;
	let createDto: CreateTemplateDto; // Value to change

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			// TODO: Fix AuthModule
			imports: [LoggerModule, DatabaseModule, TypeOrmModule.forFeature([TemplateEntity])], // Value to change
			controllers: [TemplateController], // Value to change
			providers: [TemplateService], // Value to change
		}).compile();

		controller = module.get<TemplateController>(TemplateController); // Value to change
		className = controller.constructor.name;

		createDto = new CreateTemplateDto(); // Value to change
		createDto.value = 'test'; // Value to change
	});

	// --------------------------------------------------

	it('Should be defined', () => {
		expect(controller).toBeDefined();
	});

	// --------------------------------------------------

	it('Can create an entity', async () => {
		await expect(controller.create(createDto)).resolves.toEqual({ id: id, ...createDto });
		await expect(wasLogged(testName, `${className}: Creating a new entity`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Finds all entities', async () => {
		await expect(controller.findAll()).resolves.toEqual([{ id: id, ...createDto }]);
		await expect(wasLogged(testName, `${className}: Finding all entities`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Finds an entity by its Id', async () => {
		await expect(controller.findOne(id.toString())).resolves.toEqual({ id: id, ...createDto });
		await expect(wasLogged(testName, `${className}: Finding entity with id ${id}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Updates an entity', async () => {
		const dto = new UpdateTemplateDto(); // Value to change
		dto.value = 'tested';

		await expect(controller.update(id.toString(), dto)).resolves.toEqual({ id: id, ...dto });
		await expect(wasLogged(testName, `${className}: Updating entity with id ${id}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Deletes an entity', async () => {
		await expect(controller.remove(id.toString())).resolves.toBeUndefined();
		await expect(wasLogged(testName, `${className}: Deleting entity with id ${id}`)).resolves.toBe(true);
	});
});
