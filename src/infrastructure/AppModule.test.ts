import request from "supertest";
import { Controller, Get, HttpStatus, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "./AppModule";
import { LoggerMiddleware } from "../http_api/middleware/LoggerMiddleware";
import { HttpErrorFilter } from "../http_api/filters/http_error/HttpErrorFilter";
import { HttpExceptionMessages } from "../common/enums/HttpExceptionMessages";
import { WinstonAdapter } from "./logging/adapters/WinstonAdapter";
import { mockILogger } from "../__tests__/mocks/mockLogAdapter";
import { createMockAppModule } from "../__tests__/mocks/module/createMockAppModule";

@Controller("mock")
export class MockController {
	@Get()
	hello() {
		return "Hello, World!";
	}

	@Get("/error")
	error() {
		throw new Error("Error Filter test");
	}
}

describe("AppModule", () => {
	let app: INestApplication;
	let appModule: AppModule;

	beforeEach(async () => {
		app = await createMockAppModule();
		appModule = app.get<AppModule>(AppModule);
	});

	afterEach(async () => {
		await app.close();
	});

	// --------------------------------------------------

	it("should be defined", () => {
		expect(appModule).toBeDefined();
	});

	// --------------------------------------------------

	it("should apply LoggerMiddleware globally", () => {
		const consumerMock = {
			apply: jest.fn().mockReturnThis(),
			forRoutes: jest.fn(),
		};

		appModule.configure(consumerMock as any);

		expect(consumerMock.apply).toHaveBeenCalledWith(LoggerMiddleware);
		expect(consumerMock.forRoutes).toHaveBeenCalledWith("*");
	});

	// --------------------------------------------------

	it("Can execute a GET request", async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			controllers: [MockController],
			imports: [AppModule],
		}).compile();

		const app = moduleFixture.createNestApplication();
		await app.init();

		await request(app.getHttpServer()).get("/mock").expect(200);

		await app.close();
	});

	// --------------------------------------------------

	it("Protects against any uncaught errors with a global filter", async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			controllers: [MockController],
			providers: [
				{
					useValue: mockILogger,
					provide: WinstonAdapter,
				},
			],
			imports: [AppModule],
		}).compile();

		const app = moduleFixture.createNestApplication();
		const logger = app.get(WinstonAdapter);
		app.useGlobalFilters(new HttpErrorFilter(logger));

		await app.init();

		await request(app.getHttpServer())
			.get("/mock/error")
			.expect(HttpStatus.INTERNAL_SERVER_ERROR)
			.expect((res) => {
				expect(res.body).toEqual({
					statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
					timestamp: expect.any(Number),
					path: "/mock/error",
					message: HttpExceptionMessages.INTERNAL_SERVER_ERROR,
				});
			});

		await app.close();
	});
});
