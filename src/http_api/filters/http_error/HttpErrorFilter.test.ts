import request from "supertest";
import { Controller, Get, HttpStatus, INestApplication, InternalServerErrorException, UseFilters } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { HttpExceptionMessages } from "../../../common/enums/HttpExceptionMessages";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";
import { mockILogger } from "../../../__tests__/mocks/mockLogAdapter";
import { HttpErrorFilter } from "./HttpErrorFilter";

const ERROR = new Error("HTTP error test");

const INTERNAL_SERVER_EXCEPTION_PATH = "/internal_server_exception";
const INTERNAL_SERVER_EXCEPTION = new InternalServerErrorException("HTTP Internal Server error test");

@Controller("test")
@UseFilters(HttpErrorFilter)
class TestController {
	@Get()
	hello() {
		throw ERROR;
	}

	@Get(INTERNAL_SERVER_EXCEPTION_PATH)
	internalServerException() {
		throw INTERNAL_SERVER_EXCEPTION;
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

	it("Handles the base Error class", async () => {
		await request(app.getHttpServer())
			.get(ENDPOINT)
			.expect(HttpStatus.INTERNAL_SERVER_ERROR)
			.expect((res) => {
				expect(res.body).toEqual({
					status: HttpStatus.INTERNAL_SERVER_ERROR,
					timestamp: expect.any(Number),
					path: "/test",
					message: HttpExceptionMessages.INTERNAL_SERVER_ERROR,
				});
			});

		// Verify that the logger was called
		expect(mockILogger.error).toHaveBeenCalledWith(`HTTP error test`, ERROR);
		expect(mockILogger.warn).toHaveBeenCalledWith(`Exception was caught by the default Error filter.`);
	});

	// --------------------------------------------------

	it("Handles Nest's InternalServerException class", async () => {
		const path = ENDPOINT + INTERNAL_SERVER_EXCEPTION_PATH;

		const response = await request(app.getHttpServer())
			.get(path)
			.expect(HttpStatus.INTERNAL_SERVER_ERROR)
			.expect((res) => {
				expect(res.body).toEqual({
					status: HttpStatus.INTERNAL_SERVER_ERROR,
					timestamp: expect.any(Number),
					path: path,
					message: HttpExceptionMessages.INTERNAL_SERVER_ERROR,
				});
			});

		expect(response.body.status).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
		expect(response.body.message).toEqual(HttpExceptionMessages.INTERNAL_SERVER_ERROR);
		expect(response.body.path).toEqual(path);

		// Verify that the logger was called
		expect(mockILogger.error).toHaveBeenCalledWith(`HTTP Internal Server error test`, INTERNAL_SERVER_EXCEPTION);
		expect(mockILogger.warn).toHaveBeenCalledWith(`Exception was caught by the default Error filter.`);
	});
});
