import request from "supertest";
import { Controller, Get, HttpException, HttpStatus, INestApplication, UseFilters } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { HttpExceptionMessages } from "../../../common/enums/HttpExceptionMessages";
import { HttpExceptionFilter } from "./HttpExceptionFilter";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";
import { mockILogger } from "../../../__tests__/mocks/mockLogAdapter";

const error = new HttpException("HTTP exception test", HttpStatus.BAD_REQUEST);

@Controller("test")
@UseFilters(HttpExceptionFilter)
class TestController {
	@Get()
	hello() {
		throw error;
	}
}

describe("HttpExceptionFilter", () => {
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

	it("Should handle its own errors", async () => {
		await request(app.getHttpServer())
			.get("/test")
			.expect(HttpStatus.INTERNAL_SERVER_ERROR)
			.expect((res) => {
				expect(res.body).toEqual({
					statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
					timestamp: expect.any(Number),
					path: "/test",
					message: HttpExceptionMessages.INTERNAL_SERVER_ERROR,
				});
			});

		// Verify that the logger was called
		expect(mockILogger.error).toHaveBeenCalledWith(`HTTP exception test`, error);
		expect(mockILogger.warn).toHaveBeenCalledWith(`Exception was caught by the default HTTP exception filter.`);
	});
});
