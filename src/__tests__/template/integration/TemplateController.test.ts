import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateController } from '../../../template/TemplateController';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '../../../logging/LoggerModule';
import { TemplateService } from '../../../template/TemplateService';
import { CreateTemplateDto } from '../../../template/dto/CreateTemplateDto';
import { UpdateTemplateDto } from '../../../template/dto/UpdateTemplateDto';
import { TemplateEntity } from '../../../template/entity/TemplateEntity';
import { DatabaseModule } from '../../../database/DatabaseModule';
import { wasLogged } from '../../helpers/wasLogged';
import { ICrudController } from '../../../abstract/ICrudController';
import { serverConfig } from '../../../server_config/serverConfig';

// Value to change
describe('TemplateController Integration', () => {
	const testName = 'TemplateController_Integration'; // Value to change
	process.env.TEST_NAME = testName; // Creates a log file named with this test's name.

	let controller: ICrudController<TemplateEntity, CreateTemplateDto, UpdateTemplateDto>; // Value to change
	let className: string;

	const ID = 1;
	let createDto: CreateTemplateDto; // Value to change

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({
					isGlobal: true,
					load: [serverConfig],
				}),
				LoggerModule,
				DatabaseModule,
				TypeOrmModule.forFeature([TemplateEntity]), // Value to change
			],
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
		await expect(controller.create(createDto)).resolves.toEqual({ id: ID, ...createDto });
		await expect(wasLogged(testName, `${className}: Creating a new entity`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Finds all entities', async () => {
		await expect(controller.findAll()).resolves.toEqual([{ id: ID, ...createDto }]);
		await expect(wasLogged(testName, `${className}: Finding all entities`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Finds an entity by its Id', async () => {
		await expect(controller.findOne(ID)).resolves.toEqual({ id: ID, ...createDto });
		await expect(wasLogged(testName, `${className}: Finding entity with id ${ID}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Updates an entity', async () => {
		const dto = new UpdateTemplateDto(); // Value to change
		dto.value = 'tested';

		await expect(controller.update(ID, dto)).resolves.toEqual({ id: ID, ...dto });
		await expect(wasLogged(testName, `${className}: Updating entity with id ${ID}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Deletes an entity', async () => {
		await expect(controller.remove(ID)).resolves.toBeUndefined();
		await expect(wasLogged(testName, `${className}: Deleting entity with id ${ID}`)).resolves.toBe(true);
	});
});
