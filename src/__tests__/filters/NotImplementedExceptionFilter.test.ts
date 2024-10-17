import request from 'supertest';
import { Controller, Get, HttpStatus, INestApplication, NotImplementedException, UseFilters } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LogAdapter } from '../../logging/LogAdapter';
import { mockILogger, mockLogAdapter } from '../mocks/mockLogAdapter';
import { HttpExceptionMessages } from '../../filters/HttpExceptionMessages';
import { NotImplementedExceptionFilter } from '../../filters/NotImplementedExceptionFilter';

@Controller('test')
@UseFilters(NotImplementedExceptionFilter)
class TestController {
	@Get()
	hello() {
		throw new NotImplementedException('Not implemented exception test');
	}
}

describe('NotImplementedExceptionFilter', () => {
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
			.expect(HttpStatus.NOT_IMPLEMENTED)
			.expect((res) => {
				expect(res.body).toEqual({
					statusCode: HttpStatus.NOT_IMPLEMENTED,
					timestamp: expect.any(Number),
					path: '/test',
					message: HttpExceptionMessages.NOT_IMPLEMENTED,
				});
			});

		// Verify that the logger was called
		expect(mockILogger.error).toHaveBeenCalledWith(
			`NotImplementedExceptionFilter: NotImplementedException: Not implemented exception test`,
			undefined,
		);
	});
});