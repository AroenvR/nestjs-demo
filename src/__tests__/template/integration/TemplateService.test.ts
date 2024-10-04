import { randomUUID } from 'crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../../../logging/LoggerModule';
import { TemplateService } from '../../../template/TemplateService';
import { CreateTemplateDto } from '../../../template/dto/CreateTemplateDto';
import { UpdateTemplateDto } from '../../../template/dto/UpdateTemplateDto';
import { DatabaseModule } from '../../../database/DatabaseModule';
import { TemplateEntity } from '../../../template/entities/TemplateEntity';
import { wasLogged } from '../../helpers/wasLogged';
import { AbstractService } from '../../../abstract/AbstractService';

describe('TemplateService Integration', () => {
	// Value to change
	const testName = 'TemplateService_Integration'; // Value to change
	process.env.TEST_NAME = testName; // Creates a log file named with this test's name.

	let service: AbstractService;
	let className: string;

	const id = 1;
	let createDto: CreateTemplateDto; // Value to change

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [LoggerModule, DatabaseModule, TypeOrmModule.forFeature([TemplateEntity])], // Value to change
			providers: [TemplateService], // Value to change
		}).compile();

		service = module.get<TemplateService>(TemplateService); // Value to change
		className = service.constructor.name;

		createDto = new CreateTemplateDto(); // Value to change
		createDto.value = 'test'; // Value to change
	});

	// --------------------------------------------------

	it('Should be defined', () => {
		expect(service).toBeDefined();
	});

	// --------------------------------------------------

	it('Can create an entity', async () => {
		await expect(service.create(createDto)).resolves.toEqual({ id: id, ...createDto });
		await expect(wasLogged(testName, `${className}: Creating a new entity`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Finds all entities', async () => {
		await expect(service.findAll()).resolves.toEqual([{ id: id, ...createDto }]);
		await expect(wasLogged(testName, `${className}: Finding all entities`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Finds an entity by its id', async () => {
		await expect(service.findOne(id)).resolves.toEqual({ id: id, ...createDto });
		await expect(wasLogged(testName, `${className}: Finding entity with id ${id}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Throws when unable to find an entity by its id', async () => {
		const id = 69;
		await expect(service.findOne(id)).rejects.toThrow(`Entity by id ${id} not found`);
		await expect(wasLogged(testName, `${className}: Finding entity with id ${id}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Updates an entity', async () => {
		const dto = new UpdateTemplateDto(); // Value to change
		dto.value = randomUUID().toString(); // Value to change

		await expect(service.update(id, dto)).resolves.toEqual({ id: id, ...dto });
		await expect(wasLogged(testName, `${className}: Updating entity with id ${id}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Throws when unable to find an entity to update by its id', async () => {
		const id = 69;
		const dto = new UpdateTemplateDto(); // Value to change
		dto.value = randomUUID().toString(); // Value to change

		await expect(service.update(id, dto)).rejects.toThrow(`Entity by id ${id} not found`);
		await expect(wasLogged(testName, `${className}: Updating entity with id ${id}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Deletes an entity', async () => {
		await expect(service.remove(id)).resolves.toBeUndefined();
		await expect(wasLogged(testName, `${className}: Deleting entity with id ${id}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('Throws when unable to find an entity to delete by its id', async () => {
		const id = 69;
		await expect(service.remove(id)).rejects.toThrow(`Entity by id ${id} not found`);
		await expect(wasLogged(testName, `${className}: Deleting entity with id ${id}`)).resolves.toBe(true);
	});
});
