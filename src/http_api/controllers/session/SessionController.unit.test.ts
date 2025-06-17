import { randomUUID } from "crypto";
import { Response } from "express";
import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { SessionController } from "./SessionController";
import { MockService } from "../../../__tests__/mocks/service/MockService";
import { SessionService } from "../../../application/services/session/SessionService";
import { mockILogger } from "../../../__tests__/mocks/mockLogAdapter";
import { SessionResponseDto } from "../../dtos/session/SessionResponseDto";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";
import { MockCreateSessionDto } from "../../../__tests__/mocks/dto/MockSessionDto";
import { MockUserEntity } from "../../../__tests__/mocks/entity/MockUserEntity";
import { MockJwtService } from "../../../__tests__/mocks/service/MockJwtService";
import { MockConfigService } from "../../../__tests__/mocks/service/MockConfigService";
import { mockPlainTextJwt } from "../../../__tests__/mocks/mockJwt";

describe("SessionController Unit", () => {
	let controller: SessionController;

	const MOCK_COOKIE = { user: mockPlainTextJwt };

	let uuid = randomUUID();
	let mockResponse: any;
	let mockedResponse: SessionResponseDto;

	beforeEach(async () => {
		const user = MockUserEntity.get();
		uuid = user.uuid;
		mockedResponse = SessionResponseDto.create(user);

		mockResponse = {
			cookie: jest.fn(),
			clearCookie: jest.fn(),
		} as unknown as Response;

		const module: TestingModule = await Test.createTestingModule({
			controllers: [SessionController],
			providers: [
				{
					provide: SessionService,
					useValue: new MockService(() => mockedResponse),
				},
				{
					provide: WinstonAdapter,
					useValue: mockILogger,
				},
				{
					provide: JwtService,
					useValue: new MockJwtService(),
				},
				{
					provide: ConfigService,
					useValue: new MockConfigService(),
				},
			],
		}).compile();

		controller = module.get<SessionController>(SessionController);
	});

	// --------------------------------------------------

	it("Should be defined", () => {
		expect(controller).toBeDefined();
	});

	// -------------------------------------------------- \\

	describe("CREATE", () => {
		it("Can create an entity", async () => {
			const dto = MockCreateSessionDto.get();

			await expect(controller.login(dto, mockResponse)).resolves.toEqual(mockedResponse);
			expect(mockILogger.log).toHaveBeenCalledWith(`Logging a user in.`);
			expect(mockILogger.info).toHaveBeenCalledWith(`Creating JWT for user uuid ${mockedResponse.uuid}`);
		});
	});

	// -------------------------------------------------- \\

	describe("UPDATE", () => {
		it("Updates an entity", async () => {
			await expect(controller.update(uuid, MOCK_COOKIE, mockResponse)).resolves.toEqual(mockedResponse);
			expect(mockILogger.info).toHaveBeenCalledWith(`Updating session and JWT for user uuid ${uuid}`);
		});
	});

	// -------------------------------------------------- \\

	describe("DELETE", () => {
		it("Deletes an entity", async () => {
			await expect(controller.logout(MOCK_COOKIE, mockResponse)).resolves.toBeUndefined();
			expect(mockILogger.log).toHaveBeenCalledWith(`Logging a user out.`);
			expect(mockILogger.info).toHaveBeenCalledWith(`Logged out user with uuid ${uuid}`);
		});
	});
});
