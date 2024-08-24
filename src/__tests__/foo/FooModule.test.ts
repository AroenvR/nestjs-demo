import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { FooModule } from '../../foo/FooModule';

describe('FooModule (e2e)', () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [FooModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	// --------------------------------------------------

	it('/foo (POST)', () => {
		return request(app.getHttpServer()).post('/foo').send({}).expect(400).expect({ statusCode: 400, message: 'Method not yet implemented' });
	});

	// --------------------------------------------------

	it('/foo (GET)', () => {
		return request(app.getHttpServer()).get('/foo').expect(400).expect({ statusCode: 400, message: 'Method not yet implemented' });
	});

	// --------------------------------------------------

	it('/foo/:id (GET)', () => {
		return request(app.getHttpServer()).get('/foo/1').expect(400).expect({ statusCode: 400, message: 'Method not yet implemented' });
	});

	// --------------------------------------------------

	it('/foo/:id (PATCH)', () => {
		return request(app.getHttpServer()).get('/foo/1').send({}).expect(400).expect({ statusCode: 400, message: 'Method not yet implemented' });
	});

	// --------------------------------------------------

	it('/foo/:id (DELETE)', () => {
		return request(app.getHttpServer()).get('/foo/1').expect(400).expect({ statusCode: 400, message: 'Method not yet implemented' });
	});
});
