import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./AuthController";
import { MockService } from "../../../__tests__/mocks/service/MockService";
import { mockILogger, mockWinstonAdapter } from "../../../__tests__/mocks/mockLogAdapter";
import { WinstonAdapter } from "../../../common/utility/logging/adapters/WinstonAdapter";
import { UserEntity } from "../../../domain/user/UserEntity";
import { MockUserEntity } from "../../../__tests__/mocks/entity/MockUserEntity";
import { AuthService } from "../../../application/services/auth/AuthService";
import { TokenService } from "../../../application/services/auth/TokenService";
import { UserService } from "../../../application/services/user/UserService";
import { CreateLoginDto } from "../../../http_api/dtos/login/CreateLoginDto";
import { MockCreateLoginDto } from "../../../__tests__/mocks/dto/MockLoginDto";
import { MockAuthService } from "../../../__tests__/mocks/service/MockAuthService";
import { MockConfigService } from "../../../__tests__/mocks/service/MockConfigService";
import { MockTokenService } from "../../../__tests__/mocks/service/MockTokenService";
import { securityConstants } from "../../../common/constants/securityConstants";
import { mockPlainTextBearerToken, mockPlainTextHttpOnlyJwtCookie } from "../../../__tests__/mocks/mockJwt";

describe("AuthController.Unit", () => {
	let controller: AuthController;

	let loginDto: CreateLoginDto;
	let mockUser: UserEntity;

	let mockResponse: any;

	beforeEach(async () => {
		mockUser = MockUserEntity.get();

		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{
					provide: WinstonAdapter,
					useValue: mockWinstonAdapter,
				},
				{
					provide: ConfigService,
					useValue: new MockConfigService(),
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

		expect(mockILogger.log).toHaveBeenCalledWith(`User attempting to log in.`);
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

		expect(createTokenSpy).toHaveBeenCalled();
		expect(refreshTokenSpy).toHaveBeenCalledWith(jwt.user);
		expect(authServiceSpy).toHaveBeenCalledWith(jwt.user);

		expect(mockILogger.log).toHaveBeenCalledWith(`Refreshing token and cookie for ${jwt.user.jti}`);
	});

	// --------------------------------------------------

	it("Can log a user out", async () => {
		const revokeTokenSpy = jest.spyOn(controller["tokenService"], "revokeRefreshToken");
		const token = { user: mockPlainTextBearerToken };

		await controller.logout(token, mockResponse);

		expect(mockResponse.clearCookie).toHaveBeenCalledWith(securityConstants.refreshCookieString);
		expect(revokeTokenSpy).toHaveBeenCalledWith(token.user);

		expect(mockILogger.log).toHaveBeenCalledWith(`Revoking token and cookie for user ${token.user.sub}`);
	});
});
