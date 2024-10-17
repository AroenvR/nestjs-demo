import request from 'supertest';
import { Controller, Get, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../AppModule';
import { LoggerMiddleware } from '../middleware/LoggerMiddleware';
import { mockLogAdapter } from './mocks/mockLogAdapter';
import { LogAdapter } from '../logging/LogAdapter';
import { HttpErrorFilter } from '../filters/HttpErrorFilter';
import { HttpExceptionMessages } from '../filters/HttpExceptionMessages';

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
					useValue: mockLogAdapter,
					provide: LogAdapter,
				},
			],
			imports: [AppModule],
		}).compile();

		const app = moduleFixture.createNestApplication();
		const logger = app.get(LogAdapter);
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
