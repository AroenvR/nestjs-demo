import request from 'supertest';
import { Controller, Get, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../application/modules/AppModule';
import { LoggerMiddleware } from '../http_api/middleware/LoggerMiddleware';
import { HttpErrorFilter } from '../http_api/filters/HttpErrorFilter';
import { HttpExceptionMessages } from '../common/enums/HttpExceptionMessages';
import { NewWinstonAdapter } from '../infrastructure/logging/adapters/NewWinstonAdapter';
import { mockILogger } from './mocks/mockLogAdapter';

@Controller('mock')
export class MockController {
	@Get()
	hello() {
		return 'Hello, World!';
	}

	@Get('/error')
	error() {
		throw new Error('Error Filter test');
	}
}

describe('AppModule', () => {
	let appModule: AppModule;

	beforeEach(async () => {
		const moduleRef: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		appModule = moduleRef.get<AppModule>(AppModule);
	});

	// --------------------------------------------------

	it('should be defined', () => {
		expect(appModule).toBeDefined();
	});

	// --------------------------------------------------

	it('should apply LoggerMiddleware globally', () => {
		const consumerMock = {
			apply: jest.fn().mockReturnThis(),
			forRoutes: jest.fn(),
		};

		appModule.configure(consumerMock as any);

		expect(consumerMock.apply).toHaveBeenCalledWith(LoggerMiddleware);
		expect(consumerMock.forRoutes).toHaveBeenCalledWith('*');
	});

	// --------------------------------------------------

	it('Can execute a GET request', async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			controllers: [MockController],
			imports: [AppModule],
		}).compile();

		const app = moduleFixture.createNestApplication();
		await app.init();

		await request(app.getHttpServer()).get('/mock').expect(200);
	});

	// --------------------------------------------------

	it('Protects against any uncaught errors with a global filter', async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			controllers: [MockController],
			providers: [
				{
					useValue: mockILogger,
					provide: NewWinstonAdapter,
				},
			],
			imports: [AppModule],
		}).compile();

		const app = moduleFixture.createNestApplication();
		const logger = app.get(NewWinstonAdapter);
		app.useGlobalFilters(new HttpErrorFilter(logger));

		await app.init();

		await request(app.getHttpServer())
			.get('/mock/error')
			.expect(HttpStatus.INTERNAL_SERVER_ERROR)
			.expect((res) => {
				expect(res.body).toEqual({
					statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
					timestamp: expect.any(Number),
					path: '/mock/error',
					message: HttpExceptionMessages.INTERNAL_SERVER_ERROR,
				});
			});
	});
});
