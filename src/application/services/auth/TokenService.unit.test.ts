import { randomUUID } from "crypto";
import { EntityManager } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Test, TestingModule } from "@nestjs/testing";
import { mockILogger } from "../../../__tests__/mocks/mockLogAdapter";
import { MockEntityManager } from "../../../__tests__/mocks/entity_manager/MockEntityManager";
import { MockRepository } from "../../../__tests__/mocks/repository/MockRepository";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";
import { RefreshTokenEntity } from "../../../domain/refresh_token/RefreshTokenEntity";
import { MockRefreshTokenEntity } from "../../../__tests__/mocks/entity/MockRefreshTokenEntity";
import { TokenService } from "./TokenService";
import { JwtService } from "@nestjs/jwt";
import { MockJwtService } from "../../../__tests__/mocks/service/MockJwtService";
import { ConfigService } from "@nestjs/config";
import { MockConfigService } from "../../../__tests__/mocks/service/MockConfigService";
import { EncryptionUtils } from "../../../common/utility/aes/EncryptionUtils";
import { CacheManagerAdapter } from "../../../common/utility/cache/CacheManagerAdapter";
import { MockCacheManagerAdapter } from "../../../__tests__/mocks/service/MockCacheAdapter";
import { ICreateAuthTokenData } from "../../../common/interfaces/JwtInterfaces";
import { MockEncryptionUtils } from "../../../__tests__/mocks/common/MockEncryptionUtils";
import { mockPlainTextBearerToken, mockPlainTextHttpOnlyJwtCookie } from "../../../__tests__/mocks/mockJwt";
import { securityConstants } from "../../../common/constants/securityConstants";
import { IServerConfig } from "src/infrastructure/configuration/IServerConfig";

describe("TokenService.Unit", () => {
	let mockedRefreshToken: RefreshTokenEntity;
	let service: TokenService;
	let configService: ConfigService;

	beforeEach(async () => {
		mockedRefreshToken = MockRefreshTokenEntity.get();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TokenService,
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
				{
					provide: EncryptionUtils,
					useValue: new MockEncryptionUtils(),
				},
				{
					provide: CacheManagerAdapter,
					useValue: new MockCacheManagerAdapter(),
				},
				{
					provide: getRepositoryToken(RefreshTokenEntity),
					useValue: new MockRepository(() => mockedRefreshToken),
				},
				{
					provide: EntityManager,
					useValue: new MockEntityManager<RefreshTokenEntity>(),
				},
			],
		}).compile();

		service = module.get(TokenService);
		configService = module.get(ConfigService);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	// --------------------------------------------------

	it("Should be defined", () => {
		expect(service).toBeDefined();
	});

	// --------------------------------------------------

	it("Can create an access token", async () => {
		const cacheSetSpy = jest.spyOn(service["cache"], "set");
		const jwtSignSpy = jest.spyOn(service["jwtService"], "signAsync");

		const tokenData: ICreateAuthTokenData = {
			sub: randomUUID(),
			roles: [],
		};
		const token = await service.createAccessToken(tokenData);

		expect(typeof token).toEqual("string");
		expect(token.length).toBeGreaterThan(1);

		expect(cacheSetSpy).toHaveBeenCalled();
		expect(jwtSignSpy).toHaveBeenCalledWith(expect.any(Object), { secret: process.env[securityConstants.bearerAccessTokenEnvVar] });

		expect(mockILogger.info).toHaveBeenCalledWith(`Creating access token.`);
	});

	// --------------------------------------------------

	it("Can create a HTTP-Only Cookie", async () => {
		const createTokenInfoSpy = jest.spyOn(service as any, "createHttpOnlyCookieInfo");
		const createTokenSpy = jest.spyOn(service as any, "createRefreshTokenEntity");
		const jwtSignSpy = jest.spyOn(service["jwtService"], "signAsync");

		const cookieData: ICreateAuthTokenData = {
			sub: randomUUID(),
			roles: [],
		};
		const cookie = await service.createHttpOnlyCookie(cookieData);

		expect(typeof cookie).toEqual("string");
		expect(cookie.length).toBeGreaterThan(1);

		expect(createTokenInfoSpy).toHaveBeenCalled();
		expect(createTokenSpy).toHaveBeenCalledWith(cookieData, expect.any(Object));
		expect(jwtSignSpy).toHaveBeenCalledWith(expect.any(Object), { secret: process.env[securityConstants.httpOnlyCookieEnvVar] });

		expect(mockILogger.info).toHaveBeenCalledWith(`Creating HTTP-only cookie.`);
	});

	// --------------------------------------------------

	it("Can rotate a refresh token", async () => {
		// Spying on the prototype as spying on the object makes the JSON schema fail.
		const refreshSpy = jest.spyOn(RefreshTokenEntity.prototype, "refresh");
		const jwtSignSpy = jest.spyOn(service["jwtService"], "signAsync");

		const expiry = configService.get<IServerConfig["security"]>("security").bearer.expiry;
		const timeToSet = mockedRefreshToken.lastRefreshedAt - expiry;

		mockedRefreshToken.lastRefreshedAt = timeToSet;

		const repository = service["refreshTokenRepo"];
		jest.spyOn(repository, "findOne").mockResolvedValueOnce(mockedRefreshToken);

		const cookie = await service.rotateRefreshToken(mockPlainTextHttpOnlyJwtCookie);

		expect(typeof cookie).toEqual("string");
		expect(cookie.length).toBeGreaterThan(1);

		expect(refreshSpy).toHaveBeenCalledWith(expect.any(String), expect.any(String), expect.any(Number), expect.any(Number));
		expect(jwtSignSpy).toHaveBeenCalledWith(expect.any(Object), { secret: process.env[securityConstants.httpOnlyCookieEnvVar] });

		expect(mockILogger.info).toHaveBeenCalledWith(`Refreshing token ${mockPlainTextHttpOnlyJwtCookie.jti}`);
	});

	// --------------------------------------------------

	it("Can revoke a refresh token", async () => {
		const repoRemoveSpy = jest.spyOn(service["refreshTokenRepo"], "remove");

		await service.revokeRefreshToken(mockPlainTextBearerToken);
		expect(repoRemoveSpy).toHaveBeenCalledWith(mockedRefreshToken);

		expect(mockILogger.info).toHaveBeenCalledWith(`Revoking token for user ${mockPlainTextBearerToken.sub}`);
	});
});
