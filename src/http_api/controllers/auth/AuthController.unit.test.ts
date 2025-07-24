import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./AuthController";
import { MockService } from "../../../__tests__/mocks/service/MockService";
import { UserEntity } from "../../../domain/user/UserEntity";
import { MockUserEntity } from "../../../__tests__/mocks/entity/MockUserEntity";
import { AuthService } from "../../../application/services/auth/AuthService";
import { TokenService } from "../../../application/services/auth/TokenService";
import { UserService } from "../../../application/services/user/UserService";
import { CreateLoginDto } from "../../../http_api/dtos/login/CreateLoginDto";
import { MockCreateLoginDto } from "../../../__tests__/mocks/dto/MockLoginDto";
import { MockAuthService } from "../../../__tests__/mocks/service/MockAuthService";
import { MockTokenService } from "../../../__tests__/mocks/service/MockTokenService";
import { securityConstants } from "../../../common/constants/securityConstants";
import { mockPlainTextBearerToken, mockPlainTextHttpOnlyJwtCookie } from "../../../__tests__/mocks/mockJwt";
import { WinstonAdapter } from "../../../common/utility/logging/adapters/WinstonAdapter";
import { MockUtilities } from "../../../__tests__/mocks/common/MockUtilities";
import { Utilities } from "../../../common/utility/Utilities";
import { IUtilities } from "../../../common/utility/IUtilities";
import { IPrefixedLogger } from "../../../common/utility/logging/ILogger";

describe("AuthController.Unit", () => {
	let utilities: IUtilities;
	let logger: IPrefixedLogger;

	let controller: AuthController;

	let loginDto: CreateLoginDto;
	let mockUser: UserEntity;

	let mockResponse: any;

	beforeEach(async () => {
		utilities = new MockUtilities();
		mockUser = MockUserEntity.get();

		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{
					provide: Utilities,
					useValue: utilities,
				},
				{
					provide: WinstonAdapter,
					useValue: utilities.logAdapter,
				},
				{
					provide: ConfigService,
					useValue: utilities.configService,
				},
				{
					provide: AuthService,
					useValue: new MockAuthService(() => mockUser),
				},
				{
					provide: UserService,
					useValue: new MockService(() => mockUser),
				},
				{
					provide: TokenService,
					useValue: new MockTokenService(),
				},
			],
		}).compile();

		logger = module.get<IPrefixedLogger>(WinstonAdapter);
		controller = module.get<AuthController>(AuthController);

		loginDto = MockCreateLoginDto.get();
		mockResponse = {
			cookie: jest.fn(),
			clearCookie: jest.fn(),
		} as unknown as Response;
	});

	// --------------------------------------------------

	it("Should be defined", () => {
		expect(controller).toBeDefined();
	});

	// --------------------------------------------------

	it("Can log in a user", async () => {
		const response = await controller.login(loginDto, mockResponse);

		expect(typeof response).toEqual("string");
		expect(response).not.toEqual("success");

		expect(mockResponse.cookie).toHaveBeenCalledWith(
			securityConstants.refreshCookieString,
			expect.any(String), // The actual cookie value
			expect.objectContaining({
				httpOnly: true,
				sameSite: "strict",
				secure: expect.any(Boolean),
				maxAge: expect.any(Number),
			}),
		);

		expect(mockResponse.cookie).toHaveBeenCalledWith(
			securityConstants.accessCookieString,
			expect.any(String), // The actual cookie value
			expect.objectContaining({
				httpOnly: true,
				sameSite: "strict",
				secure: expect.any(Boolean),
				maxAge: expect.any(Number),
			}),
		);

		expect(logger.log).toHaveBeenCalledWith(`User attempting to log in.`);
	});

	// --------------------------------------------------

	it("Can accept a request to refresh a token", async () => {
		const authServiceSpy = jest.spyOn(controller["authService"], "findUserByCookie");
		const createTokenSpy = jest.spyOn(controller["tokenService"], "createAccessToken");
		const refreshTokenSpy = jest.spyOn(controller["tokenService"], "rotateRefreshToken");
		const jwt = { user: mockPlainTextHttpOnlyJwtCookie };

		const response = await controller.refresh(jwt, mockResponse);

		expect(typeof response).toEqual("string");
		expect(response).not.toEqual("success");

		expect(mockResponse.cookie).toHaveBeenCalledWith(
			securityConstants.refreshCookieString,
			expect.any(String), // The actual cookie value
			expect.objectContaining({
				httpOnly: true,
				sameSite: "strict",
				secure: expect.any(Boolean),
				maxAge: expect.any(Number),
			}),
		);

		expect(mockResponse.cookie).toHaveBeenCalledWith(
			securityConstants.accessCookieString,
			expect.any(String), // The actual cookie value
			expect.objectContaining({
				httpOnly: true,
				sameSite: "strict",
				secure: expect.any(Boolean),
				maxAge: expect.any(Number),
			}),
		);

		expect(createTokenSpy).toHaveBeenCalled();
		expect(refreshTokenSpy).toHaveBeenCalledWith(jwt.user);
		expect(authServiceSpy).toHaveBeenCalledWith(jwt.user);

		expect(logger.log).toHaveBeenCalledWith(`Refreshing token and cookie for ${jwt.user.jti}`);
	});

	// --------------------------------------------------

	it("Can log a user out", async () => {
		const revokeTokenSpy = jest.spyOn(controller["tokenService"], "revokeRefreshToken");
		const token = { user: mockPlainTextBearerToken };

		await controller.logout(token, mockResponse);

		expect(mockResponse.clearCookie).toHaveBeenCalledWith(securityConstants.refreshCookieString);
		expect(mockResponse.clearCookie).toHaveBeenCalledWith(securityConstants.accessCookieString);
		expect(revokeTokenSpy).toHaveBeenCalledWith(token.user);

		expect(logger.log).toHaveBeenCalledWith(`Revoking token and cookie for user ${token.user.sub}`);
	});
});
