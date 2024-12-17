import request from 'supertest';
import { Controller, Get, HttpStatus, INestApplication, UseFilters } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { mockILogger } from '../mocks/mockLogAdapter';
import { HttpExceptionMessages } from '../../common/enums/HttpExceptionMessages';
import { QueryFailedErrorFilter } from '../../http_api/filters/QueryFailedErrorFilter';
import { NewWinstonAdapter } from '../../infrastructure/logging/adapters/NewWinstonAdapter';

@Controller('test')
@UseFilters(QueryFailedErrorFilter)
class TestController {
	@Get()
	hello() {
		throw new QueryFailedError('Query failed', ['param1', 'param2'], new Error('Query failed error test'));
	}
}

describe('QueryFailedErrorFilter', () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			controllers: [TestController],
			providers: [
				{
					useValue: mockILogger,
					provide: NewWinstonAdapter,
				},
			],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	// --------------------------------------------------

	it('Should handle its own errors', async () => {
		await request(app.getHttpServer())
			.get('/test')
			.expect(HttpStatus.INTERNAL_SERVER_ERROR)
			.expect((res) => {
				expect(res.body).toEqual({
					statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
					timestamp: expect.any(Number),
					path: '/test',
					message: HttpExceptionMessages.INTERNAL_SERVER_ERROR,
				});
			});

		// Verify that the logger was called
		expect(mockILogger.error).toHaveBeenCalledWith(`QueryFailedError: Query failed error test`);
		expect(mockILogger.verbose).toHaveBeenCalledWith(`QueryFailedError query: Query failed - parameters:`, ['param1', 'param2']);
	});
});
