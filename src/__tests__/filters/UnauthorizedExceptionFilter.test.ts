import request from 'supertest';
import { Controller, Get, HttpStatus, INestApplication, UnauthorizedException, UseFilters } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockILogger } from '../mocks/mockLogAdapter';
import { HttpExceptionMessages } from '../../common/enums/HttpExceptionMessages';
import { UnauthorizedExceptionFilter } from '../../common/filters/UnauthorizedExceptionFilter';
import { NewWinstonAdapter } from '../../infrastructure/logging/adapters/NewWinstonAdapter';

@Controller('test')
@UseFilters(UnauthorizedExceptionFilter)
class TestController {
	@Get()
	hello() {
		throw new UnauthorizedException('Unauthorized exception test');
	}
}

describe('UnauthorizedExceptionFilter', () => {
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
			.expect(HttpStatus.UNAUTHORIZED)
			.expect((res) => {
				expect(res.body).toEqual({
					statusCode: HttpStatus.UNAUTHORIZED,
					timestamp: expect.any(Number),
					path: '/test',
					message: HttpExceptionMessages.UNAUTHORIZED,
				});
			});

		// Verify that the logger was called
		expect(mockILogger.error).toHaveBeenCalledWith(`UnauthorizedExceptionFilter: UnauthorizedException: Unauthorized exception test`, undefined);
	});
});
