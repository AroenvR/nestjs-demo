import request from "supertest";
import { Controller, Get, HttpStatus, INestApplication, UnauthorizedException, UseFilters } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { HttpExceptionMessages } from "../../../common/enums/HttpExceptionMessages";
import { UnauthorizedExceptionFilter } from "./UnauthorizedExceptionFilter";
import { mockILogger } from "../../../__tests__/mocks/mockLogAdapter";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";

const error = new UnauthorizedException("Unauthorized exception test");

@Controller("test")
@UseFilters(UnauthorizedExceptionFilter)
class TestController {
	@Get()
	hello() {
		throw error;
	}
}

describe("UnauthorizedExceptionFilter", () => {
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
			.expect(HttpStatus.UNAUTHORIZED)
			.expect((res) => {
				expect(res.body).toEqual({
					statusCode: HttpStatus.UNAUTHORIZED,
					timestamp: expect.any(Number),
					path: "/test",
					message: HttpExceptionMessages.UNAUTHORIZED,
				});
			});

		// Verify that the logger was called
		expect(mockILogger.error).toHaveBeenCalledWith(`Unauthorized exception test`, error);
	});
});
