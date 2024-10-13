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

	const POST_VALUE = { value: randomUUID() }; // Value to change
	const STATUS_CODE = 201;
	const EXPECTED_OBJ = { id: 1, ...POST_VALUE };

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [LoggerModule, DatabaseModule, TemplateModule], // Value to change
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	// --------------------------------------------------

	it('/template (POST)', async () => {
		await request(app.getHttpServer()).post('/template').send(POST_VALUE).expect(STATUS_CODE).expect(EXPECTED_OBJ);

		await expect(wasLogged(testName, `TemplateController: Creating a new entity`)).resolves.toBe(true);
		await expect(wasLogged(testName, `TemplateService: Creating a new entity`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('/template (GET)', async () => {
		await request(app.getHttpServer()).post('/template').send(POST_VALUE).expect(STATUS_CODE).expect(EXPECTED_OBJ);

		await request(app.getHttpServer()).get('/template').expect(200).expect([EXPECTED_OBJ]);

		await expect(wasLogged(testName, `TemplateController: Finding all entities`)).resolves.toBe(true);
		await expect(wasLogged(testName, `TemplateService: Finding all entities`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('/template/:id (GET)', async () => {
		await request(app.getHttpServer()).post('/template').send(POST_VALUE).expect(STATUS_CODE).expect(EXPECTED_OBJ);
		await request(app.getHttpServer()).get(`/template/${EXPECTED_OBJ.id}`).expect(200).expect(EXPECTED_OBJ);

		await expect(wasLogged(testName, `TemplateController: Finding entity with id ${EXPECTED_OBJ.id}`)).resolves.toBe(true);
		await expect(wasLogged(testName, `TemplateService: Finding entity with id ${EXPECTED_OBJ.id}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('/template/:id (PATCH)', async () => {
		await request(app.getHttpServer()).post('/template').send(POST_VALUE).expect(STATUS_CODE).expect(EXPECTED_OBJ);

		await request(app.getHttpServer()).patch(`/template/${EXPECTED_OBJ.id}`).send(POST_VALUE).expect(200).expect(EXPECTED_OBJ);

		await expect(wasLogged(testName, `TemplateController: Updating entity with id ${EXPECTED_OBJ.id}`)).resolves.toBe(true);
		await expect(wasLogged(testName, `TemplateService: Updating entity with id ${EXPECTED_OBJ.id}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('/template/:id (DELETE)', async () => {
		await request(app.getHttpServer()).post('/template').send(POST_VALUE).expect(STATUS_CODE).expect(EXPECTED_OBJ);
		await request(app.getHttpServer()).delete(`/template/${EXPECTED_OBJ.id}`).expect(204);

		await expect(wasLogged(testName, `TemplateController: Deleting entity with id ${EXPECTED_OBJ.id}`)).resolves.toBe(true);
		await expect(wasLogged(testName, `TemplateService: Deleting entity with id ${EXPECTED_OBJ.id}`)).resolves.toBe(true);
	});
});
