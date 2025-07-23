import { randomUUID } from "crypto";
import jwt, { decode } from "jsonwebtoken";
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { INestApplication } from "@nestjs/common";
import { TokenService } from "./TokenService";
import { createMockAppModule } from "../../../__tests__/mocks/module/createMockAppModule";
import { AuthModule } from "../../../http_api/modules/auth/AuthModule";
import { RefreshTokenEntity } from "../../../domain/refresh_token/RefreshTokenEntity";
import { IBearerToken, ICreateAuthTokenData, IHttpOnlyCookie } from "../../../common/interfaces/JwtInterfaces";
import { CacheManagerAdapter } from "../../../common/utility/cache/CacheManagerAdapter";
import { CacheKeys } from "../../../common/enums/CacheKeys";
import { wasLogged } from "../../../__tests__/helpers/wasLogged";

const TEST_NAME = "TokenService.Integration";
describe(TEST_NAME, () => {
	process.env.TEST_NAME = TEST_NAME; // Creates a log file named with this test's name.

	let app: INestApplication;
	let service: TokenService;
	let repository: Repository<RefreshTokenEntity>;
	let cache: CacheManagerAdapter;

	beforeAll(async () => {
		app = await createMockAppModule(AuthModule);
		service = app.get(TokenService);
		repository = app.get(getRepositoryToken(RefreshTokenEntity));
		cache = app.get(CacheManagerAdapter);
	});

	afterEach(async () => {
		await repository.clear();
	});

	afterAll(async () => {
		await app.close();
	});

	// --------------------------------------------------

	it("Should be defined", () => {
		expect(service).toBeDefined();
	});

	// --------------------------------------------------

	it("Can create an Authorization: Bearer access token", async () => {
		const tokenData: ICreateAuthTokenData = {
			sub: randomUUID(),
			roles: [],
		};
		const token = await service.createAccessToken(tokenData);
		expect(typeof token).toEqual("string");

		const decoded = decode(token) as IBearerToken;
		expect(decoded.sub).toEqual(tokenData.sub);
		expect(decoded.roles).toEqual(tokenData.roles);
		expect(decoded.iat).toEqual(expect.any(Number));
		expect(decoded.exp).toEqual(expect.any(Number));

		const cached = await cache.get(CacheKeys.JWT_JTI + decoded.jti);
		expect(cached).toBe(true);

		await expect(wasLogged(TEST_NAME, `${service.constructor.name}: Creating access token.`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it("Can create an HTTP-Only Cookie", async () => {
		const tokenData: ICreateAuthTokenData = {
			sub: randomUUID(),
			roles: [],
		};

		const token = await service.createRefreshCookie(tokenData);
		expect(typeof token).toEqual("string");

		const decoded = decode(token) as IHttpOnlyCookie;
		expect(decoded.jti).toEqual(expect.any(String));
		expect(decoded.iat).toEqual(expect.any(Number));
		expect(decoded.exp).toEqual(expect.any(Number));

		const refreshToken = await repository.findOne({
			where: { jti: decoded.jti },
		});
		expect(refreshToken).toBeInstanceOf(RefreshTokenEntity);
		expect(refreshToken.jti).toEqual(decoded.jti);
		expect(refreshToken.sub).toEqual(tokenData.sub);

		await expect(wasLogged(TEST_NAME, `${service.constructor.name}: Creating a new refresh entity for ${tokenData.sub}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it("Can rotate a refresh token", async () => {
		const tokenData: ICreateAuthTokenData = {
			sub: randomUUID(),
			roles: [],
		};
		const initialToken = await service.createRefreshCookie(tokenData);
		const decodedInitialToken = decode(initialToken) as IHttpOnlyCookie;
		const initialTokenEntity = await repository.findOne({
			where: { jti: decodedInitialToken.jti },
		});

		const now = Date.now();
		jest.useFakeTimers({ doNotFake: ["nextTick"] }); // Do not mock nextTick or jwtService.signAsync gets stuck.
		jest.setSystemTime(now + 15 * 60 * 1000); // Advance time by 15 minutes

		const token = await service.rotateRefreshToken(decodedInitialToken); // throws here
		expect(token).not.toEqual(initialToken);

		jest.useRealTimers();

		const decoded = decode(token) as IHttpOnlyCookie;
		expect(decoded).not.toEqual(decodedInitialToken);

		const refreshTokenEntity = await repository.findOne({
			where: { jti: decoded.jti },
		});
		expect(refreshTokenEntity.id).toEqual(initialTokenEntity.id);
		expect(refreshTokenEntity.uuid).toEqual(initialTokenEntity.uuid);
		expect(refreshTokenEntity.createdAt).toEqual(initialTokenEntity.createdAt);

		expect(refreshTokenEntity.jti).not.toEqual(initialTokenEntity.jti);
		expect(refreshTokenEntity.hash).not.toEqual(initialTokenEntity.hash);
		expect(refreshTokenEntity.lastRefreshedAt).toBeGreaterThan(initialTokenEntity.lastRefreshedAt);

		await expect(wasLogged(TEST_NAME, `${service.constructor.name}: Refreshing token ${decodedInitialToken.jti}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it("Can revoke a refresh token", async () => {
		const tokenData: ICreateAuthTokenData = {
			sub: randomUUID(),
			roles: [],
		};
		const token = await service.createAccessToken(tokenData);
		const decodedToken = decode(token) as IBearerToken;

		const cookie = await service.createRefreshCookie(tokenData);
		const decodedCookie = decode(cookie) as IHttpOnlyCookie;

		const refreshTokenEntity = await repository.findOne({
			where: { sub: decodedToken.sub },
		});
		expect(refreshTokenEntity.jti).toEqual(decodedCookie.jti);

		await service.revokeRefreshToken(decodedToken);

		const query1 = await repository.findOne({
			where: { sub: decodedToken.sub },
		});
		expect(query1).toBeNull();

		const query2 = await repository.findOne({
			where: { jti: decodedCookie.jti },
		});
		expect(query2).toBeNull();

		await expect(wasLogged(TEST_NAME, `${service.constructor.name}: Revoking token for user ${tokenData.sub}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	describe("Errors", () => {
		it("Can not rotate a refresh token too early", async () => {
			const tokenData: ICreateAuthTokenData = {
				sub: randomUUID(),
				roles: [],
			};
			const initialToken = await service.createRefreshCookie(tokenData);
			const decodedInitialToken = decode(initialToken) as IHttpOnlyCookie;

			await expect(service.rotateRefreshToken(decodedInitialToken)).rejects.toThrow("Refreshing too soon.");
		});
	});

	// --------------------------------------------------

	describe("JwtService test", () => {
		const secret = "test_secret";

		it("respects manually set exp when no expiresIn is passed", () => {
			const now = Math.floor(Date.now() / 1000);
			const exp = now + 3600;

			const token = jwt.sign({ jti: "abc", iat: now, exp }, secret);

			const decoded = jwt.decode(token) as any;

			expect(decoded.exp).toBe(exp);
			expect(decoded.iat).toBe(now);
		});

		// --------------------------------------------------

		it("throws if both exp and expiresIn are provided", () => {
			const now = Math.floor(Date.now() / 1000);
			const exp = now + 3600;

			expect(() => {
				jwt.sign({ jti: "abc", iat: now, exp }, secret, { expiresIn: 3600 });
			}).toThrow(/Bad \"options.expiresIn\" option the payload already has an \"exp\" property./);
		});
	});
});
