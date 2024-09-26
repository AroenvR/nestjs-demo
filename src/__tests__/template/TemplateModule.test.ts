import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { LoggerModule } from '../../logging/LoggerModule';
import { DatabaseModule } from '../../database/DatabaseModule';
import { TemplateModule } from '../../template/TemplateModule';
import { wasLogged } from '../helpers/wasLogged';

const testName = 'TemplateModule';
describe(testName, () => {
	process.env.TEST_NAME = testName; // Creates a log file named with this test's name.

	let app: INestApplication;

	const postVal = {};
	const code = 501;
	const expected = { statusCode: code, message: 'Method not implemented' };

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [LoggerModule, DatabaseModule, TemplateModule],
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

		await request(app.getHttpServer()).get('/template').expect(code).expect(expected);

		await expect(wasLogged(testName, `TemplateController: Finding all entities`)).resolves.toBe(true);
		await expect(wasLogged(testName, `TemplateService: Finding all entities`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('/template/:id (GET)', async () => {
		await request(app.getHttpServer()).post('/template').send(postVal).expect(code).expect(expected);

		const id = 1;
		await request(app.getHttpServer()).get(`/template/${id}`).expect(code).expect(expected);

		await expect(wasLogged(testName, `TemplateController: Finding entity with id ${id}`)).resolves.toBe(true);
		await expect(wasLogged(testName, `TemplateService: Finding entity with id ${id}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('/template/:id (PATCH)', async () => {
		await request(app.getHttpServer()).post('/template').send(postVal).expect(code).expect(expected);

		const id = 1;
		await request(app.getHttpServer())
			.patch(`/template/${id}`)
			.send({}) // PATCH payload
			.expect(501) // Should be 200
			.expect(expected);

		await expect(wasLogged(testName, `TemplateController: Updating entity with id ${id}`)).resolves.toBe(true);
		await expect(wasLogged(testName, `TemplateService: Updating entity with id ${id}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('/template/:id (DELETE)', async () => {
		const id = 1;
		await request(app.getHttpServer()).delete(`/template/${id}`).expect(501); // Should be 204

		await expect(wasLogged(testName, `TemplateController: Deleting entity with id ${id}`)).resolves.toBe(true);
		await expect(wasLogged(testName, `TemplateService: Deleting entity with id ${id}`)).resolves.toBe(true);
	});
});
