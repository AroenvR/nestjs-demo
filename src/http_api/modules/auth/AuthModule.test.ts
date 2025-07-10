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

const TEST_NAME = "AuthModule";
describe(TEST_NAME, () => {
	process.env.TEST_NAME = TEST_NAME; // Creates a log file named with this test's name.

	const ENDPOINT = "/v1/auth";

	let accessTokenConfig: IBearerAuthConfig;
	let cookieConfig: ICookieAuthConfig;

	let app: INestApplication;
	let cacheManager: CacheManagerAdapter;

	let repository: Repository<RefreshTokenEntity>;
	let userRepo: Repository<UserEntity>;

	let userEntity: UserEntity;
	let loginDto: CreateLoginDto;

	beforeAll(async () => {
		app = await createMockAppModule(AuthModule);
		cacheManager = app.get(CacheManagerAdapter);

		repository = app.get(getRepositoryToken(RefreshTokenEntity));
		userRepo = app.get(getRepositoryToken(UserEntity));

		const configService = app.get(ConfigService);
		accessTokenConfig = configService.get<IServerConfig["security"]>("security").bearer;
		cookieConfig = configService.get<IServerConfig["security"]>("security").cookie;
	});

	beforeEach(async () => {
		loginDto = MockCreateLoginDto.get();

		const user = MockUserEntity.get();
		user.password = loginDto.password;

		userEntity = await userRepo.save(user);
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
		expect(app).toBeDefined();
	});

	// --------------------------------------------------

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
		expect(diff).toBeGreaterThanOrEqual(expectedMs - 1000); // Allow a 1s margin of error on both sides
		expect(diff).toBeLessThanOrEqual(expectedMs + 1000); // Allow a 1s margin of error on both sides

		const decodedCookie = decode(parsed.jwt) as IHttpOnlyCookie;
		expect(decodedCookie.jti).toEqual(expect.any(String));
		expect(decodedCookie.iat).toEqual(expect.any(Number));
		expect(decodedCookie.exp).toEqual(expect.any(Number));

		await expect(cacheManager.get(CacheKeys.JWT_JTI + decodedAccessToken.jti)).resolves.toBe(true);
		await expect(cacheManager.get(CacheKeys.JWT_JTI + decodedCookie.jti)).resolves.toBe(true);
		await expect(cacheManager.get(CacheKeys.USER_UUID + userEntity.uuid)).resolves.toBe(true);

		await expect(wasLogged(TEST_NAME, `AuthController: User attempting to log in.`)).resolves.toBe(true);
		await expect(wasLogged(TEST_NAME, `AuthService: Authenticating a user.`)).resolves.toBe(true);
		await expect(wasLogged(TEST_NAME, `TokenService: Creating HTTP-only cookie.`)).resolves.toBe(true);
		await expect(wasLogged(TEST_NAME, `TokenService: Creating a new refresh entity for ${userEntity.uuid}`)).resolves.toBe(true);
		await expect(wasLogged(TEST_NAME, `TokenService: Creating access token.`)).resolves.toBe(true);
		await expect(wasLogged(TEST_NAME, `TokenService: Signing JWT`)).resolves.toBe(true);
	});

	// TODO: assert the cacheManager's JTI caching behaves as expected
	// - bearer tokens
	// - http cookies
	// expiry
	// revoked as expected
});
