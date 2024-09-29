import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../../logging/LoggerModule';
import { TemplateService } from '../../template/TemplateService';
import { CreateTemplateDto } from '../../template/dto/CreateTemplateDto';
import { UpdateTemplateDto } from '../../template/dto/UpdateTemplateDto';
import { DatabaseModule } from '../../database/DatabaseModule';
import { TemplateEntity } from '../../template/entities/TemplateEntity';
import { wasLogged } from '../helpers/wasLogged';

const testName = 'TemplateService';
describe(testName, () => {
	process.env.TEST_NAME = testName; // Creates a log file named with this test's name.

	let service: TemplateService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [LoggerModule, DatabaseModule, TypeOrmModule.forFeature([TemplateEntity])],
			providers: [TemplateService],
		}).compile();

		service = module.get<TemplateService>(TemplateService);
	});

	// --------------------------------------------------

	it('Should be defined', () => {
		expect(service).toBeDefined();
	});

	// --------------------------------------------------

	it('Can create an entity', async () => {
		const dto = new CreateTemplateDto();
		await expect(service.create(dto)).rejects.toThrow('Method not implemented');
		await expect(wasLogged(testName, `${testName}: Creating a new entity`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Finds all entities', async () => {
		await expect(service.findAll()).rejects.toThrow('Method not implemented');
		await expect(wasLogged(testName, `${testName}: Finding all entities`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Finds an entity by its Id', async () => {
		const id = 1;

		await expect(service.findOne(id)).rejects.toThrow('Method not implemented');
		await expect(wasLogged(testName, `${testName}: Finding entity with id ${id}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Updates an entity', async () => {
		const id = 1;
		const dto = new UpdateTemplateDto();

		await expect(service.update(id, dto)).rejects.toThrow('Method not implemented');
		await expect(wasLogged(testName, `${testName}: Updating entity with id ${id}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Deletes an entity', async () => {
		const id = 1;

		await expect(service.remove(id)).rejects.toThrow('Method not implemented');
		await expect(wasLogged(testName, `${testName}: Deleting entity with id ${id}`)).resolves.toBe(true);
	});
});
