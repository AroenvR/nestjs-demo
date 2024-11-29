import request from 'supertest';
import { Controller, Get, HttpStatus, INestApplication, NotFoundException, UseFilters } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NestLogger } from '../../infrastructure/logging/NestLogger';
import { mockILogger, mockLogAdapter } from '../mocks/mockLogAdapter';
import { NotFoundExceptionFilter } from '../../common/filters/NotFoundExceptionFilter';
import { HttpExceptionMessages } from '../../common/enums/HttpExceptionMessages';

@Controller('test')
@UseFilters(NotFoundExceptionFilter)
class TestController {
	@Get()
	hello() {
		throw new NotFoundException('Not found exception test');
	}
}

describe('NotFoundExceptionFilter', () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			controllers: [TestController],
			providers: [
				{
					useValue: mockLogAdapter,
					provide: NestLogger,
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
			.expect(HttpStatus.NOT_FOUND)
			.expect((res) => {
				expect(res.body).toEqual({
					statusCode: HttpStatus.NOT_FOUND,
					timestamp: expect.any(Number),
					path: '/test',
					message: HttpExceptionMessages.NOT_FOUND,
				});
			});

		// Verify that the logger was called
		expect(mockILogger.error).toHaveBeenCalledWith(`NotFoundExceptionFilter: NotFoundException: Not found exception test`, undefined);
	});
});
