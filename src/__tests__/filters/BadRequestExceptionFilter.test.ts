import request from 'supertest';
import { BadRequestException, Controller, Get, HttpStatus, INestApplication, UseFilters } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockILogger } from '../mocks/mockLogAdapter';
import { HttpExceptionMessages } from '../../common/enums/HttpExceptionMessages';
import { BadRequestExceptionFilter } from '../../common/filters/BadRequestExceptionFilter';
import { NewWinstonAdapter } from '../../infrastructure/logging/adapters/NewWinstonAdapter';

@Controller('test')
@UseFilters(BadRequestExceptionFilter)
class TestController {
	@Get()
	hello() {
		throw new BadRequestException('Bad request exception test');
	}
}

describe('BadRequestExceptionFilter', () => {
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
			.expect(HttpStatus.BAD_REQUEST)
			.expect((res) => {
				expect(res.body).toEqual({
					statusCode: HttpStatus.BAD_REQUEST,
					timestamp: expect.any(Number),
					path: '/test',
					message: HttpExceptionMessages.BAD_REQUEST,
				});
			});

		// Verify that the logger was called
		expect(mockILogger.error).toHaveBeenCalledWith(`BadRequestExceptionFilter: BadRequestException: Bad request exception test`, undefined);
	});
});
