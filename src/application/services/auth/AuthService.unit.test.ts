import { EntityManager } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Test, TestingModule } from "@nestjs/testing";
import { UserEntity } from "../../../domain/user/UserEntity";
import { mockILogger } from "../../../__tests__/mocks/mockLogAdapter";
import { MockEntityManager } from "../../../__tests__/mocks/entity_manager/MockEntityManager";
import { MockRepository } from "../../../__tests__/mocks/repository/MockRepository";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";
import { MockUserEntity } from "../../../__tests__/mocks/entity/MockUserEntity";
import { RefreshTokenEntity } from "../../../domain/refresh_token/RefreshTokenEntity";
import { AuthService } from "./AuthService";
import { MockRefreshTokenEntity } from "../../../__tests__/mocks/entity/MockRefreshTokenEntity";
import { MockCreateLoginDto } from "../../../__tests__/mocks/dto/MockLoginDto";
import { mockPlainTextBearerToken } from "../../../__tests__/mocks/mockJwt";

describe("AuthService.Unit", () => {
	let mockedUser: UserEntity;
	let mockedRefreshToken: RefreshTokenEntity;
	let service: AuthService;

	beforeEach(async () => {
		mockedUser = MockUserEntity.get();
		mockedRefreshToken = MockRefreshTokenEntity.get();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: WinstonAdapter,
					useValue: mockILogger,
				},
				{
					provide: getRepositoryToken(UserEntity),
					useValue: new MockRepository(() => mockedUser),
				},
				{
					provide: getRepositoryToken(RefreshTokenEntity),
					useValue: new MockRepository(() => mockedRefreshToken),
				},
				{
					provide: EntityManager,
					useValue: new MockEntityManager<UserEntity>(),
				},
			],
		}).compile();

		service = module.get(AuthService);
	});

	// --------------------------------------------------

	it("Should be defined", () => {
		expect(service).toBeDefined();
	});

	// --------------------------------------------------

	it("Can authenticate a user", async () => {
		const dto = MockCreateLoginDto.get();

		const authenticated = await service.authenticate(dto);
		expect(authenticated).toBeInstanceOf(UserEntity);

		expect(authenticated.username).toEqual(mockedUser.username);
		expect(authenticated.password).toEqual(mockedUser.password);

		expect(mockILogger.info).toHaveBeenCalledWith(`Authenticating a user.`);
	});

	// --------------------------------------------------

	it("Throws when unable to find a user to authenticate", async () => {
		const repository = service["userRepo"];
		repository["findOne"] = jest.fn().mockResolvedValueOnce(null);

		const dto = MockCreateLoginDto.get();
		await expect(service.authenticate(dto)).rejects.toThrow(`${service.constructor.name}: Authentication failed. User not found.`);
		expect(mockILogger.info).toHaveBeenCalledWith(`Authenticating a user.`);
	});

	// --------------------------------------------------

	it("Can find a user by a JTI", async () => {
		const found = await service.findUserByCookie(mockPlainTextBearerToken);
		expect(found).toBeInstanceOf(UserEntity);

		expect(found.username).toEqual(mockedUser.username);
		expect(found.password).toEqual(mockedUser.password);

		expect(mockILogger.info).toHaveBeenCalledWith(`Finding user for JWT ${mockPlainTextBearerToken.jti}`);
	});

	// --------------------------------------------------

	it("Throws when unable to find a user by JTI", async () => {
		const repository = service["tokenRepo"];
		repository["findOne"] = jest.fn().mockResolvedValueOnce(null);

		await expect(service.findUserByCookie(mockPlainTextBearerToken)).rejects.toThrow(
			`${AuthService.name}: Token with JTI ${mockPlainTextBearerToken.jti} not found.`,
		);
		expect(mockILogger.info).toHaveBeenCalledWith(`Finding user for JWT ${mockPlainTextBearerToken.jti}`);
	});

	// --------------------------------------------------

	it("Throws when unable to find a refresh token by SUB", async () => {
		const repository = service["userRepo"];
		repository["findOne"] = jest.fn().mockResolvedValueOnce(null);

		await expect(service.findUserByCookie(mockPlainTextBearerToken)).rejects.toThrow(
			`${AuthService.name}: User with UUID ${mockPlainTextBearerToken.sub} not found.`,
		);
		expect(mockILogger.info).toHaveBeenCalledWith(`Finding user for JWT ${mockPlainTextBearerToken.jti}`);
	});
});
