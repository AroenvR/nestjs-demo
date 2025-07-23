import { randomUUID } from "crypto";
import { Repository } from "typeorm";
import { INestApplication } from "@nestjs/common";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { AuthController } from "./AuthController";
import { wasLogged } from "../../../__tests__/helpers/wasLogged";
import { createMockAppModule } from "../../../__tests__/mocks/module/createMockAppModule";
import { AuthModule } from "../../modules/auth/AuthModule";
import { MockUserEntity } from "../../../__tests__/mocks/entity/MockUserEntity";
import { UserEntity } from "../../../domain/user/UserEntity";
import { RefreshTokenEntity } from "../../../domain/refresh_token/RefreshTokenEntity";
import { mockPlainTextBearerToken, mockPlainTextHttpOnlyJwtCookie } from "../../../__tests__/mocks/mockJwt";
import { IBearerAuthConfig, IRefreshCookieAuthConfig, IServerConfig } from "../../../infrastructure/configuration/IServerConfig";
import { IHttpOnlyCookie, INestJSBearerJwt, INestJSCookieJwt } from "../../../common/interfaces/JwtInterfaces";
import { securityConstants } from "../../../common/constants/securityConstants";
import { CreateLoginDto } from "../../../http_api/dtos/login/CreateLoginDto";
import { MockCreateLoginDto } from "../../../__tests__/mocks/dto/MockLoginDto";

const TEST_NAME = "AuthController.Integration";
describe(TEST_NAME, () => {
	process.env.TEST_NAME = TEST_NAME; // Creates a log file named with this test's name.

	let ptsHttpCookie: INestJSCookieJwt;
	let ptsBearerToken: INestJSBearerJwt;

	let app: INestApplication;
	let cookieConfig: IRefreshCookieAuthConfig;
	let bearerConfig: IBearerAuthConfig;

	let className: string;
	let controller: AuthController;
	let userRepo: Repository<UserEntity>;
	let repository: Repository<RefreshTokenEntity>;

	let user: UserEntity;

	let loginDto: CreateLoginDto;
	let mockResponse: any;

	beforeAll(async () => {
		app = await createMockAppModule(AuthModule);

		controller = app.get<AuthController>(AuthController);
		userRepo = app.get(getRepositoryToken(UserEntity));
		repository = app.get(getRepositoryToken(RefreshTokenEntity));

		const configService = app.get<ConfigService>(ConfigService);
		cookieConfig = configService.get<IServerConfig["security"]>("security").refresh_cookie;
		bearerConfig = configService.get<IServerConfig["security"]>("security").bearer;

		className = controller.constructor.name;
	});

	beforeEach(async () => {
		user = await userRepo.save(MockUserEntity.get());

		ptsHttpCookie = { user: mockPlainTextHttpOnlyJwtCookie };
		ptsBearerToken = { user: mockPlainTextBearerToken };

		loginDto = MockCreateLoginDto.get();

		mockResponse = {
			cookie: jest.fn(),
			clearCookie: jest.fn(),
		} as unknown as Response;
	});

	afterEach(async () => {
		await repository.clear();
		await userRepo.clear();
	});

	afterAll(async () => {
		await app.close();
	});

	// --------------------------------------------------

	it("Should be defined", () => {
		expect(controller).toBeDefined();
	});

	// -------------------------------------------------- \\

	describe("LOGIN", () => {
		it("Can create an entity", async () => {
			const response = await controller.login(loginDto, mockResponse);
			expect(typeof response).toEqual("string");
			expect(response).not.toEqual("success");

			expect(mockResponse.cookie).toHaveBeenCalledWith(
				securityConstants.refreshCookieString,
				expect.any(String), // The actual cookie value
				expect.objectContaining({
					httpOnly: true,
					sameSite: "strict",
					secure: cookieConfig.secure,
					maxAge: cookieConfig.expiry,
				}),
			);

			const token = await repository.findOneBy({ sub: user.uuid });
			expect(token.jti).toBeDefined();
			expect(token.sub).toEqual(user.uuid);
			expect(token.hash).toBeDefined();
			expect(token.lastRefreshedAt).toBeDefined();

			await expect(wasLogged(TEST_NAME, `${className}: User attempting to log in`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `AuthService: Authenticating a user`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `TokenService: Creating HTTP-only cookie`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `TokenService: Creating a new refresh entity for ${user.uuid}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `TokenService: Creating access token`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it("Throws when logging in with an invalid user", async () => {
			loginDto.password = randomUUID();
			await expect(controller.login(loginDto, mockResponse)).rejects.toThrow(`Authentication failed. User not found.`);
		});

		// --------------------------------------------------

		it("Should fail with empty input", async () => {
			// @ts-expect-error: Null isn't a valid parameter
			await expect(controller.login(null)).rejects.toThrow(`${className}: Create payload is empty.`);
		});
	});

	// -------------------------------------------------- \\

	describe("WHO AM I", () => {
		it("Can check an authenticated user's info", async () => {
			const TOKEN = { user: mockPlainTextBearerToken };
			const response = await controller.whoAmI(TOKEN);

			const found = await userRepo.findOneBy({ uuid: TOKEN.user.sub });
			expect(response.username).toEqual(found.username);

			await expect(wasLogged(TEST_NAME, `${className}: Retrieving information for user ${TOKEN.user.sub}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it("Throws when the user isn't found", async () => {
			const token = { user: mockPlainTextBearerToken };

			const uuid = randomUUID();
			token.user.sub = uuid;

			await expect(controller.whoAmI(token)).rejects.toThrow(`Entity by uuid ${uuid} not found`);
		});

		// --------------------------------------------------

		it("Throws on empty input", async () => {
			await expect(controller.whoAmI(null)).rejects.toThrow(`${className}: Missing JWT information for whoami request.`);
		});
	});

	// -------------------------------------------------- \\

	describe("REFRESH", () => {
		it("Updates an entity", async () => {
			const jti = randomUUID();
			const iat = Math.floor(Date.now() / 1000);
			const mockHttpCookieInfo: IHttpOnlyCookie = {
				jti: jti,
				iat: iat,
				exp: iat + cookieConfig.expiry,
			};

			const createInfo = controller["tokenService"]["createHttpOnlyCookieInfo"];
			controller["tokenService"]["createHttpOnlyCookieInfo"] = jest.fn().mockImplementationOnce(() => Promise.resolve(mockHttpCookieInfo));

			await controller.login(loginDto, mockResponse);

			controller["tokenService"]["createHttpOnlyCookieInfo"] = createInfo;

			// Advance time by `bearerConfig.expiry` or we end up with a `refreshing too soon` error.
			jest.useFakeTimers({ doNotFake: ["nextTick"] }); // Do not mock nextTick or jwtService.signAsync gets stuck.
			jest.advanceTimersByTime(bearerConfig.expiry);

			await controller.refresh({ user: mockHttpCookieInfo }, mockResponse);

			jest.useRealTimers();

			await expect(wasLogged(TEST_NAME, `${className}: Refreshing token and cookie for ${jti}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `TokenService: Refreshing token ${jti}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `TokenService: Signing JWT: ${jti}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `TokenService: Creating access token`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it("Throws when a JWT wasn't provided", async () => {
			// @ts-expect-error: Empty object isn't a valid parameter.
			await expect(controller.refresh({}, mockResponse)).rejects.toThrow(`${className}: Missing JWT information for refresh request.`);
		});

		// --------------------------------------------------

		it("Throws when updating a non-existent entity", async () => {
			ptsHttpCookie.user.jti = randomUUID();
			await expect(controller.refresh(ptsHttpCookie, mockResponse)).rejects.toThrow(
				`AuthService: Token with JTI ${ptsHttpCookie.user.jti} not found.`,
			);
		});

		// --------------------------------------------------

		it("Throws when updating a token too early", async () => {
			const jti = randomUUID();
			const iat = Math.floor(Date.now() / 1000);
			const mockHttpCookieInfo: IHttpOnlyCookie = {
				jti: jti,
				iat: iat,
				exp: iat + cookieConfig.expiry,
			};

			const createInfo = controller["tokenService"]["createHttpOnlyCookieInfo"];
			controller["tokenService"]["createHttpOnlyCookieInfo"] = jest.fn().mockImplementationOnce(() => Promise.resolve(mockHttpCookieInfo));

			await controller.login(loginDto, mockResponse);

			controller["tokenService"]["createHttpOnlyCookieInfo"] = createInfo;

			await expect(controller.refresh({ user: mockHttpCookieInfo }, mockResponse)).rejects.toThrow(`Refreshing too soon.`);
		});

		// --------------------------------------------------

		it("Throws when updating a token without a valid user", async () => {
			await controller.login(loginDto, mockResponse);

			const tokenEntities = await repository.find();
			const entity = tokenEntities[0];
			ptsHttpCookie.user.jti = entity.jti;

			const sub = randomUUID();
			entity.sub = sub;
			await repository.save(entity);

			await expect(controller.refresh(ptsHttpCookie, mockResponse)).rejects.toThrow(`AuthService: User with UUID ${sub} not found`);
		});

		// --------------------------------------------------

		it("Throws when updating with an invalid JWT", async () => {
			await controller.login(loginDto, mockResponse);

			const tokenEntities = await repository.find();
			const entity = tokenEntities[0];
			ptsHttpCookie.user.jti = entity.jti;

			// Changing the exp value bricks the checksum query.
			ptsHttpCookie.user.exp = Date.now() + 69;

			await expect(controller.refresh(ptsHttpCookie, mockResponse)).rejects.toThrow(`TokenService: Refresh token not found.`);
		});
	});

	// -------------------------------------------------- \\

	describe("LOGOUT", () => {
		it("Deletes an entity", async () => {
			await controller.login(loginDto, mockResponse);

			ptsBearerToken.user.sub = user.uuid;
			await controller.logout(ptsBearerToken, mockResponse);

			expect(mockResponse.clearCookie).toHaveBeenCalledWith(securityConstants.refreshCookieString);

			await expect(wasLogged(TEST_NAME, `${className}: Revoking token and cookie for user ${user.uuid}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `TokenService: Revoking token for user ${user.uuid}`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it("Throws when attempting a logout request without a JWT", async () => {
			// @ts-expect-error: Passing an empty object to simulate no JWT
			await expect(controller.logout({}, mockResponse)).rejects.toThrow("Missing JWT information for logout request");
			expect(mockResponse.clearCookie).toHaveBeenCalledWith(securityConstants.refreshCookieString);
		});

		// --------------------------------------------------

		it("Throws when attempting a logout request for an invalid subject", async () => {
			await expect(controller.logout(ptsBearerToken, mockResponse)).rejects.toThrow(`Token for user ${ptsBearerToken.user.sub} not found.`);
			expect(mockResponse.clearCookie).toHaveBeenCalledWith(securityConstants.refreshCookieString);
		});
	});
});
