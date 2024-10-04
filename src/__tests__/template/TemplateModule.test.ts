import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { LoggerModule } from '../../logging/LoggerModule';
import { DatabaseModule } from '../../database/DatabaseModule';
import { TemplateModule } from '../../template/TemplateModule';
import { wasLogged } from '../helpers/wasLogged';
import { randomUUID } from 'crypto';

const testName = 'TemplateModule'; // Value to change
describe(testName, () => {
	process.env.TEST_NAME = testName; // Creates a log file named with this test's name.

	let app: INestApplication;

	const postVal = { value: randomUUID() }; // Value to change

	const code = 201;
	const expected = { id: 1, ...postVal };

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [LoggerModule, DatabaseModule, TemplateModule], // Value to change
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	// --------------------------------------------------

	it('/template (POST)', async () => {
		await request(app.getHttpServer()).post('/template').send(postVal).expect(code).expect(expected);

		await expect(wasLogged(testName, `TemplateController: Creating a new entity`)).resolves.toBe(true);
		await expect(wasLogged(testName, `TemplateService: Creating a new entity`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('/template (GET)', async () => {
		await request(app.getHttpServer()).post('/template').send(postVal).expect(code).expect(expected);

		await request(app.getHttpServer()).get('/template').expect(200).expect([expected]);

		await expect(wasLogged(testName, `TemplateController: Finding all entities`)).resolves.toBe(true);
		await expect(wasLogged(testName, `TemplateService: Finding all entities`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('/template/:id (GET)', async () => {
		await request(app.getHttpServer()).post('/template').send(postVal).expect(code).expect(expected);
		await request(app.getHttpServer()).get(`/template/${expected.id}`).expect(200).expect(expected);

		await expect(wasLogged(testName, `TemplateController: Finding entity with id ${expected.id}`)).resolves.toBe(true);
		await expect(wasLogged(testName, `TemplateService: Finding entity with id ${expected.id}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('/template/:id (PATCH)', async () => {
		await request(app.getHttpServer()).post('/template').send(postVal).expect(code).expect(expected);

		await request(app.getHttpServer()).patch(`/template/${expected.id}`).send(postVal).expect(200).expect(expected);

		await expect(wasLogged(testName, `TemplateController: Updating entity with id ${expected.id}`)).resolves.toBe(true);
		await expect(wasLogged(testName, `TemplateService: Updating entity with id ${expected.id}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('/template/:id (DELETE)', async () => {
		await request(app.getHttpServer()).post('/template').send(postVal).expect(code).expect(expected);
		await request(app.getHttpServer()).delete(`/template/${expected.id}`).expect(204);

		await expect(wasLogged(testName, `TemplateController: Deleting entity with id ${expected.id}`)).resolves.toBe(true);
		await expect(wasLogged(testName, `TemplateService: Deleting entity with id ${expected.id}`)).resolves.toBe(true);
	});
});
