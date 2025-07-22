import request from "supertest";
import { Controller, Get, HttpStatus, INestApplication, InternalServerErrorException, UseFilters } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { HttpExceptionMessages } from "../../../common/enums/HttpExceptionMessages";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";
import { mockILogger } from "../../../__tests__/mocks/mockLogAdapter";
import { InternalServerExceptionFilter } from "./InternalServerExceptionFilter";

const ERROR = new InternalServerErrorException("HTTP Internal Server error test");

@Controller("test")
@UseFilters(InternalServerExceptionFilter)
class TestController {
	@Get()
	hello() {
		throw ERROR;
	}
}

describe("HttpErrorFilter", () => {
	let app: INestApplication;

	const ENDPOINT = "/test";

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

	it("Handles Nest's InternalServerException class", async () => {
		const response = await request(app.getHttpServer())
			.get(ENDPOINT)
			.expect(HttpStatus.INTERNAL_SERVER_ERROR)
			.expect((res) => {
				expect(res.body).toEqual({
					status: HttpStatus.INTERNAL_SERVER_ERROR,
					timestamp: expect.any(Number),
					path: ENDPOINT,
					message: HttpExceptionMessages.INTERNAL_SERVER_ERROR,
				});
			});

		// Verify a safe error object was returned
		expect(response.body.status).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
		expect(response.body.timestamp).toEqual(expect.any(Number));
		expect(response.body.message).toEqual(HttpExceptionMessages.INTERNAL_SERVER_ERROR);
		expect(response.body.path).toEqual(ENDPOINT);

		// TODO: Use a JSON schema which can be reused by the future middleware.
		for (const key of Object.keys(response.body)) {
			if (key === "status") continue;
			if (key === "timestamp") continue;
			if (key === "message") continue;
			if (key === "path") continue;
			throw new Error(`[TEST]: Key not allowed.`);
		}

		// Verify that the logger was called
		expect(mockILogger.error).toHaveBeenCalledWith(`HTTP Internal Server error test`, ERROR);
	});
});
