import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { wasLogged } from '../helpers/wasLogged';
import { LoggerModule } from '../../logging/LoggerModule';
import { DatabaseModule } from '../../database/DatabaseModule';
import { TemplateModule } from '../../template/TemplateModule';
import { AuthModule } from '../..//auth/AuthModule';
import { mockJwt } from '../mocks/mockJwt';

const testName = 'TemplateModule'; // Value to change
describe(testName, () => {
	process.env.TEST_NAME = testName; // Creates a log file named with this test's name.

	let app: INestApplication;

	const POST_VALUE = { value: randomUUID() }; // Value to change
	const STATUS_CODE = 201;
	const EXPECTED_OBJ = { id: 1, ...POST_VALUE };

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [LoggerModule, DatabaseModule, TemplateModule, AuthModule], // Value to change
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	// --------------------------------------------------

	it('/template (POST)', async () => {
		await request(app.getHttpServer())
			.post('/template')
			.send(POST_VALUE)
			.set('Cookie', [`jwt=${mockJwt}`])
			.expect(STATUS_CODE)
			.expect(EXPECTED_OBJ);

		await expect(wasLogged(testName, `TemplateController: Creating a new entity`)).resolves.toBe(true);
		await expect(wasLogged(testName, `TemplateService: Creating a new entity`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('/template (GET)', async () => {
		await request(app.getHttpServer())
			.post('/template')
			.send(POST_VALUE)
			.set('Cookie', [`jwt=${mockJwt}`])
			.expect(STATUS_CODE)
			.expect(EXPECTED_OBJ);

		await request(app.getHttpServer())
			.get('/template')
			.set('Cookie', [`jwt=${mockJwt}`])
			.expect(200)
			.expect([EXPECTED_OBJ]);

		await expect(wasLogged(testName, `TemplateController: Finding all entities`)).resolves.toBe(true);
		await expect(wasLogged(testName, `TemplateService: Finding all entities`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('/template/:id (GET)', async () => {
		await request(app.getHttpServer())
			.post('/template')
			.send(POST_VALUE)
			.set('Cookie', [`jwt=${mockJwt}`])
			.expect(STATUS_CODE)
			.expect(EXPECTED_OBJ);

		await request(app.getHttpServer())
			.get(`/template/${EXPECTED_OBJ.id}`)
			.set('Cookie', [`jwt=${mockJwt}`])
			.expect(200)
			.expect(EXPECTED_OBJ);

		await expect(wasLogged(testName, `TemplateController: Finding entity with id ${EXPECTED_OBJ.id}`)).resolves.toBe(true);
		await expect(wasLogged(testName, `TemplateService: Finding entity with id ${EXPECTED_OBJ.id}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('/template/:id (PATCH)', async () => {
		await request(app.getHttpServer())
			.post('/template')
			.send(POST_VALUE)
			.set('Cookie', [`jwt=${mockJwt}`])
			.expect(STATUS_CODE)
			.expect(EXPECTED_OBJ);

		await request(app.getHttpServer())
			.patch(`/template/${EXPECTED_OBJ.id}`)
			.send(POST_VALUE)
			.set('Cookie', [`jwt=${mockJwt}`])
			.expect(200)
			.expect(EXPECTED_OBJ);

		await expect(wasLogged(testName, `TemplateController: Updating entity with id ${EXPECTED_OBJ.id}`)).resolves.toBe(true);
		await expect(wasLogged(testName, `TemplateService: Updating entity with id ${EXPECTED_OBJ.id}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it('/template/:id (DELETE)', async () => {
		await request(app.getHttpServer())
			.post('/template')
			.send(POST_VALUE)
			.set('Cookie', [`jwt=${mockJwt}`])
			.expect(STATUS_CODE)
			.expect(EXPECTED_OBJ);

		await request(app.getHttpServer())
			.delete(`/template/${EXPECTED_OBJ.id}`)
			.set('Cookie', [`jwt=${mockJwt}`])
			.expect(204);

		await expect(wasLogged(testName, `TemplateController: Deleting entity with id ${EXPECTED_OBJ.id}`)).resolves.toBe(true);
		await expect(wasLogged(testName, `TemplateService: Deleting entity with id ${EXPECTED_OBJ.id}`)).resolves.toBe(true);
	});
});
