import request from 'supertest';
import { BadRequestException, Controller, Get, HttpStatus, INestApplication, UseFilters } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestExceptionFilter } from './BadRequestExceptionFilter';
import { mockILogger } from '../../../__tests__/mocks/mockLogAdapter';
import { WinstonAdapter } from '../../../infrastructure/logging/adapters/WinstonAdapter';
import { HttpExceptionMessages } from '../../../common/enums/HttpExceptionMessages';

const error = new BadRequestException('Bad request exception test');

@Controller('test')
@UseFilters(BadRequestExceptionFilter)
class TestController {
	@Get()
	hello() {
		throw error;
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
		expect(mockILogger.error).toHaveBeenCalledWith(`Bad request exception test`, error);
	});
});
