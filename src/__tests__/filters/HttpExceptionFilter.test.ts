import request from 'supertest';
import { Controller, Get, HttpException, HttpStatus, INestApplication, UseFilters } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LogAdapter } from '../../infrastructure/logging/LogAdapter';
import { mockILogger, mockLogAdapter } from '../mocks/mockLogAdapter';
import { HttpExceptionMessages } from '../../common/enums/HttpExceptionMessages';
import { HttpExceptionFilter } from '../../common/filters/HttpExceptionFilter';

@Controller('test')
@UseFilters(HttpExceptionFilter)
class TestController {
	@Get()
	hello() {
		throw new HttpException('HTTP exception test', HttpStatus.BAD_REQUEST);
	}
}

describe('HttpExceptionFilter', () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			controllers: [TestController],
			providers: [
				{
					useValue: mockLogAdapter,
					provide: LogAdapter,
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
		expect(mockILogger.error).toHaveBeenCalledWith(`HttpExceptionFilter: HttpException: HTTP exception test`, undefined);
		expect(mockILogger.warn).toHaveBeenCalledWith(`HttpExceptionFilter: Exception was caught by the default HTTP exception filter.`, undefined);
	});
});
