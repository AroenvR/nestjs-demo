import { randomUUID } from "crypto";
import request from "supertest";
import { decode } from "jsonwebtoken";
import { Repository } from "typeorm";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { AuthModule } from "./AuthModule";
import { wasLogged } from "../../../__tests__/helpers/wasLogged";
import { createMockAppModule } from "../../../__tests__/mocks/module/createMockAppModule";
import { RefreshTokenEntity } from "../../../domain/refresh_token/RefreshTokenEntity";
import { UserEntity } from "../../../domain/user/UserEntity";
import { MockUserEntity } from "../../../__tests__/mocks/entity/MockUserEntity";
import { CreateLoginDto } from "../../../http_api/dtos/login/CreateLoginDto";
import { MockCreateLoginDto } from "../../../__tests__/mocks/dto/MockLoginDto";
import { IBearerToken, IHttpOnlyCookie } from "../../../common/interfaces/JwtInterfaces";
import { parseSetCookie } from "../../../__tests__/helpers/parseSetCookie";
import { IBearerAuthConfig, ICookieAuthConfig, IServerConfig } from "../../../infrastructure/configuration/IServerConfig";
import { CacheManagerAdapter } from "../../../common/utility/cache/CacheManagerAdapter";
import { CacheKeys } from "../../../common/enums/CacheKeys";
import { AuthService } from "../../../application/services/auth/AuthService";
import { HttpExceptionMessages } from "../../../common/enums/HttpExceptionMessages";

const TEST_NAME = "AuthModule";
describe(TEST_NAME, () => {
	process.env.TEST_NAME = TEST_NAME; // Creates a log file named with this test's name.

	const ENDPOINT = "/v1/auth";

	let app: INestApplication;
	let cacheManager: CacheManagerAdapter;
	let authService: AuthService;

	let configService: ConfigService;
	let serverConfig: IServerConfig;
	let accessTokenConfig: IBearerAuthConfig;
	let cookieConfig: ICookieAuthConfig;

	let repository: Repository<RefreshTokenEntity>;
	let userRepo: Repository<UserEntity>;

	let userEntity: UserEntity;
	let loginDto: CreateLoginDto;

	let authenticateSpy: jest.SpyInstance<Promise<UserEntity>>;

	beforeAll(async () => {
		app = await createMockAppModule(AuthModule);
		cacheManager = app.get(CacheManagerAdapter);
		authService = app.get(AuthService);

		repository = app.get(getRepositoryToken(RefreshTokenEntity));
		userRepo = app.get(getRepositoryToken(UserEntity));

		configService = app.get(ConfigService);
		accessTokenConfig = configService.get<IServerConfig["security"]>("security").bearer;
		cookieConfig = configService.get<IServerConfig["security"]>("security").cookie;
	});

	beforeEach(async () => {
		loginDto = MockCreateLoginDto.get();

		const user = MockUserEntity.get();
		user.password = loginDto.password;

		userEntity = await userRepo.save(user);

		authenticateSpy = jest.spyOn(authService, "authenticate");
	});

	afterEach(async () => {
		await repository.clear();
		await userRepo.clear();

		jest.restoreAllMocks();
		jest.clearAllTimers();
	});

	afterAll(async () => {
		await app.close();
	});

	// --------------------------------------------------

	it("Should be defined", () => {
		expect(app).toBeDefined();
	});

	// --------------------------------------------------

	/*
	Components found:
	Guards (Bearer, Swagger, Cookie, JWKS)
	Middlewares (Logging, DTO, Cache (TODO))
	Controller
	ConfigService
	AuthService
	TokenService
	JwtService
	EncryptionUtils
	CacheManagerAdapter
	UserService


Paths found in the Gaurds:

Paths found inside the Controller:
Empty payload

Authenticated
Config found
HTTP cookie enabled
HTTP cookie created
Bearer token enabled
Bearer token created

Paths found inside the AuthService:


Paths found inside the TokenService:

*/

	describe("LOGIN", () => {
		it("Can log in a user", async () => {
			const response = await request(app.getHttpServer())
				.post(ENDPOINT + "/login")
				.send(loginDto)
				.expect(HttpStatus.CREATED);

			/* Assert the returned Access Token JWT */
			const accessToken = response.text;
			expect(typeof accessToken).toEqual("string");
			expect(accessToken).not.toEqual("success");

			const decodedAccessToken = decode(accessToken) as IBearerToken;
			expect(decodedAccessToken.jti).toEqual(expect.any(String));
			expect(decodedAccessToken.sub).toEqual(userEntity.uuid);
			expect(decodedAccessToken.roles).toEqual([]);
			expect(decodedAccessToken.iat).toEqual(expect.any(Number));
			expect(decodedAccessToken.exp).toEqual(expect.any(Number));

			/* Assert the returned HTTP-Only Cookie refresh_token */
			const rawRefreshCookie = response.get("Set-Cookie").find((cookieStr) => cookieStr.startsWith("refresh_token="));
			expect(rawRefreshCookie).toBeDefined();

			const parsed = parseSetCookie(rawRefreshCookie);
			expect(parsed.name).toBe("refresh_token");
			expect(typeof parsed.jwt).toBe("string");
			expect(parsed.maxAge).toBe(cookieConfig.expiry / 1000);
			expect(parsed.httpOnly).toBe(true);
			expect(parsed.sameSite).toBe("Strict");

			const now = Date.now();
			const diff = parsed.expires - now;
			const expectedMs = cookieConfig.expiry;
			expect(diff).toBeGreaterThanOrEqual(expectedMs - 5000); // Allow a 5s margin of error on both sides
			expect(diff).toBeLessThanOrEqual(expectedMs + 5000); // Allow a 5s margin of error on both sides

			const decodedCookie = decode(parsed.jwt) as IHttpOnlyCookie;
			expect(decodedCookie.jti).toEqual(expect.any(String));
			expect(decodedCookie.iat).toEqual(expect.any(Number));
			expect(decodedCookie.exp).toEqual(expect.any(Number));

			await expect(cacheManager.get(CacheKeys.JWT_JTI + decodedAccessToken.jti)).resolves.toBe(true);
			await expect(cacheManager.get(CacheKeys.JWT_JTI + decodedCookie.jti)).resolves.toBe(true);
			await expect(cacheManager.get(CacheKeys.USER_UUID + userEntity.uuid)).resolves.toBe(true);

			expect(authenticateSpy).toHaveBeenCalledWith(loginDto);
			expect(await authenticateSpy.mock.results[0].value).toMatchObject(userEntity);

			await expect(wasLogged(TEST_NAME, `AuthController: User attempting to log in.`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `AuthService: Authenticating a user.`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `TokenService: Creating HTTP-only cookie.`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `TokenService: Creating a new refresh entity for ${userEntity.uuid}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `TokenService: Creating access token.`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `TokenService: Signing JWT`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		describe("Errors", () => {
			const PATH = ENDPOINT + "/login";

			it("Handles an empty payload", async () => {
				const response = await request(app.getHttpServer()).post(PATH).expect(HttpStatus.BAD_REQUEST);

				expect(response.body.statusCode).toEqual(HttpStatus.BAD_REQUEST);
				expect(response.body.message).toEqual(HttpExceptionMessages.BAD_REQUEST);
			});

			// --------------------------------------------------

			it("Handles when it cannot find a user to authenticate", async () => {
				loginDto.password = randomUUID();

				const response = await request(app.getHttpServer()).post(PATH).send(loginDto).expect(HttpStatus.BAD_REQUEST);

				expect(response.body.statusCode).toEqual(HttpStatus.BAD_REQUEST);
				expect(response.body.message).toEqual(HttpExceptionMessages.BAD_REQUEST);
			});

			// --------------------------------------------------

			it("Throws when the server's security scheme isn't configured.", async () => {
				const customSecurityConfig = {};
				jest.spyOn(configService, "get").mockReturnValue(customSecurityConfig);

				const response = await request(app.getHttpServer()).post(PATH).send(loginDto).expect(HttpStatus.INTERNAL_SERVER_ERROR);

				expect(response.body.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
				expect(response.body.message).toEqual(HttpExceptionMessages.INTERNAL_SERVER_ERROR);
			});

			// --------------------------------------------------

			it("Throws when the Bearer Authentication scheme isn't configured.", async () => {
				const customSecurityConfig = { security: { bearer: "yolo" } };
				jest.spyOn(configService, "get").mockReturnValue(customSecurityConfig);

				const response = await request(app.getHttpServer()).post(PATH).send(loginDto).expect(HttpStatus.INTERNAL_SERVER_ERROR);

				expect(response.body.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
				expect(response.body.message).toEqual(HttpExceptionMessages.INTERNAL_SERVER_ERROR);
			});

			// --------------------------------------------------

			it("Throws when the Bearer Authentication scheme isn't enabled.", async () => {
				const customSecurityConfig = { security: { bearer: { enabled: false } } };
				jest.spyOn(configService, "get").mockReturnValue(customSecurityConfig);

				const response = await request(app.getHttpServer()).post(PATH).send(loginDto).expect(HttpStatus.INTERNAL_SERVER_ERROR);

				expect(response.body.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
				expect(response.body.message).toEqual(HttpExceptionMessages.INTERNAL_SERVER_ERROR);
			});
		});
	});

	// --------------------------------------------------

	describe("WHOAMI", () => {
		it("Can let a client know who they are", async () => {
			const login = await request(app.getHttpServer())
				.post(ENDPOINT + "/login")
				.send(loginDto)
				.expect(HttpStatus.CREATED);
			const accessToken = login.text;

			const response = await request(app.getHttpServer())
				.get(ENDPOINT + "/whoami")
				.set("Authorization", `Bearer ${accessToken}`)
				.expect(HttpStatus.OK);

			expect(response.body.isDto).toEqual(true);

			expect(response.body.id).toEqual(userEntity.id);
			expect(response.body.uuid).toEqual(userEntity.uuid);
			expect(response.body.createdAt).toEqual(userEntity.createdAt);
			expect(response.body.username).toEqual(userEntity.username);
			expect(response.body.password).toBeUndefined();
		});
	});

	// --------------------------------------------------

	describe("REFRESH", () => {
		it("Can refresh an access token", async () => {
			const loginResp = await request(app.getHttpServer())
				.post(ENDPOINT + "/login")
				.send(loginDto)
				.expect(HttpStatus.CREATED);

			const ogAccessToken = loginResp.text;
			const decodedOgToken = decode(ogAccessToken) as IBearerToken;

			const ogCookie = parseSetCookie(loginResp.get("Set-Cookie").find((cookieStr) => cookieStr.startsWith("refresh_token=")));
			const decodedOgCookie = decode(ogCookie.jwt) as IHttpOnlyCookie;

			jest.useFakeTimers({ doNotFake: ["nextTick"] }); // Do not mock nextTick or jwtService.signAsync gets stuck.
			jest.setSystemTime(Date.now() + 15 * 60 * 1000); // Advance time by 15 minutes

			const response = await request(app.getHttpServer())
				.patch(ENDPOINT + "/refresh")
				.set("Cookie", [`refresh_token=${ogCookie.jwt}`])
				.expect(HttpStatus.OK);

			jest.useRealTimers();

			const accessToken = response.text;
			const cookie = parseSetCookie(response.get("Set-Cookie").find((cookieStr) => cookieStr.startsWith("refresh_token=")));

			expect(accessToken).not.toEqual(ogAccessToken);
			expect(ogCookie).not.toEqual(cookie);

			const decodedAccessToken = decode(accessToken) as IBearerToken;
			expect(decodedAccessToken.jti).toEqual(expect.any(String));
			expect(decodedAccessToken.sub).toEqual(userEntity.uuid);
			expect(decodedAccessToken.roles).toEqual([]);
			expect(decodedAccessToken.iat).toEqual(expect.any(Number));
			expect(decodedAccessToken.exp).toEqual(expect.any(Number));
			expect(decodedAccessToken.sub).toEqual(userEntity.uuid);
			expect(decodedAccessToken.jti).not.toEqual(decodedOgToken.jti);

			const decodedCookie = decode(cookie.jwt) as IHttpOnlyCookie;
			expect(decodedCookie.jti).toEqual(expect.any(String));
			expect(decodedCookie.iat).toEqual(expect.any(Number));
			expect(decodedCookie.exp).toEqual(expect.any(Number));
			expect(decodedCookie.jti).not.toEqual(decodedOgCookie.jti);

			await expect(cacheManager.get(CacheKeys.JWT_JTI + decodedOgCookie.jti)).resolves.toBe(undefined);
			await expect(cacheManager.get(CacheKeys.JWT_JTI + decodedAccessToken.jti)).resolves.toBe(true);
			await expect(cacheManager.get(CacheKeys.JWT_JTI + decodedCookie.jti)).resolves.toBe(true);
		});

		// --------------------------------------------------

		describe("Errors", () => {
			it("Cannot refresh an access token too early", async () => {
				const response = await request(app.getHttpServer())
					.post(ENDPOINT + "/login")
					.send(loginDto)
					.expect(HttpStatus.CREATED);
				const cookie = parseSetCookie(response.get("Set-Cookie").find((cookieStr) => cookieStr.startsWith("refresh_token=")));

				await request(app.getHttpServer())
					.patch(ENDPOINT + "/refresh")
					.set("Cookie", [`refresh_token=${cookie.jwt}`])
					.expect(HttpStatus.BAD_REQUEST);
			});
		});
	});

	describe("LOGOUT", () => {
		it("Can log a user out", async () => {
			const login = await request(app.getHttpServer())
				.post(ENDPOINT + "/login")
				.send(loginDto)
				.expect(HttpStatus.CREATED);
			const accessToken = login.text;

			const response = await request(app.getHttpServer())
				.delete(ENDPOINT + "/logout")
				.set("Authorization", `Bearer ${accessToken}`)
				.expect(HttpStatus.NO_CONTENT);

			expect(response.body).toEqual({});
			expect(response.text).toEqual("");

			// TOOD:
			// Assert it works with each scheme individually
			// As well as all schemes combined

			// Assert the HTTP cookie was cleared
			// Assert the JTI's were deleted from cache
			// Assert the RefreshTokenEntity was deleted from the repository
		});
	});
});
