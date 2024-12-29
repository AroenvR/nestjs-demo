import request from 'supertest';
import { Controller, Get, HttpStatus, INestApplication, UseFilters } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { mockILogger } from '../../../__tests__/mocks/mockLogAdapter';
import { HttpExceptionMessages } from '../../../common/enums/HttpExceptionMessages';
import { WinstonAdapter } from '../../../infrastructure/logging/adapters/WinstonAdapter';
import { QueryFailedErrorFilter } from './QueryFailedErrorFilter';

const error = new QueryFailedError('Query failed', ['param1', 'param2'], new Error('Query failed error test'));

@Controller('test')
@UseFilters(QueryFailedErrorFilter)
class TestController {
	@Get()
	hello() {
		throw error;
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
					provide: WinstonAdapter,
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
		expect(mockILogger.error).toHaveBeenCalledWith(`Query failed error test`, error);
		expect(mockILogger.verbose).toHaveBeenCalledWith(`QueryFailedError query: Query failed - parameters:`, ['param1', 'param2']);
	});
});
