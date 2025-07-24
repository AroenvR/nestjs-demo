import request from "supertest";
import { Controller, Get, HttpStatus, INestApplication, NotImplementedException, UseFilters } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { NotImplementedExceptionFilter } from "./NotImplementedExceptionFilter";
import { HttpExceptionMessages } from "../../../common/enums/HttpExceptionMessages";
import { mockILogger } from "../../../__tests__/mocks/mockLogAdapter";
import { WinstonAdapter } from "../../../common/utility/logging/adapters/WinstonAdapter";

const error = new NotImplementedException("Not implemented exception test");

@Controller("test")
@UseFilters(NotImplementedExceptionFilter)
class TestController {
	@Get()
	hello() {
		throw error;
	}
}

describe("NotImplementedExceptionFilter", () => {
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
			.expect(HttpStatus.NOT_IMPLEMENTED)
			.expect((res) => {
				expect(res.body).toEqual({
					status: HttpStatus.NOT_IMPLEMENTED,
					timestamp: expect.any(Number),
					path: "/test",
					message: HttpExceptionMessages.NOT_IMPLEMENTED,
				});
			});

		// Verify that the logger was called
		expect(mockILogger.error).toHaveBeenCalledWith(`Not implemented exception test`, error);
	});
});
