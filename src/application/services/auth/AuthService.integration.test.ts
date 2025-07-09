import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "../../../domain/user/UserEntity";
import { AuthService } from "./AuthService";
import { wasLogged } from "../../../__tests__/helpers/wasLogged";
import { createMockAppModule } from "../../../__tests__/mocks/module/createMockAppModule";
import { UserModule } from "../../../http_api/modules/user/UserModule";
import { MockUserEntity } from "../../../__tests__/mocks/entity/MockUserEntity";
import { INestApplication } from "@nestjs/common";
import { RefreshTokenEntity } from "../../../domain/refresh_token/RefreshTokenEntity";
import { CreateLoginDto } from "../../../http_api/dtos/login/CreateLoginDto";
import { MockCreateLoginDto } from "../../../__tests__/mocks/dto/MockLoginDto";
import { randomUUID } from "crypto";
import { mockPlainTextBearerToken } from "../../../__tests__/mocks/mockJwt";
import { MockRefreshTokenEntity } from "../../../__tests__/mocks/entity/MockRefreshTokenEntity";

const TEST_NAME = "AuthService.Integration";
describe(TEST_NAME, () => {
	process.env.TEST_NAME = TEST_NAME; // Creates a log file named with this test's name.

	let app: INestApplication;

	let userRepo: Repository<UserEntity>;
	let tokenRepo: Repository<RefreshTokenEntity>;
	let service: AuthService;
	let className: string;

	let entity: UserEntity;
	let loginDto: CreateLoginDto;

	beforeAll(async () => {
		app = await createMockAppModule(UserModule);

		userRepo = app.get(getRepositoryToken(UserEntity));
		tokenRepo = app.get(getRepositoryToken(RefreshTokenEntity));
		service = app.get(AuthService);

		className = service.constructor.name;
	});

	beforeEach(async () => {
		loginDto = MockCreateLoginDto.get();

		const user = MockUserEntity.get();
		entity = await userRepo.save(user);

		const token = MockRefreshTokenEntity.get();
		await tokenRepo.save(token);
	});

	afterEach(async () => {
		await userRepo.clear();
		await tokenRepo.clear();
	});

	afterAll(async () => {
		await app.close();
	});

	// --------------------------------------------------

	it("Should be defined", () => {
		expect(service).toBeDefined();
	});

	// --------------------------------------------------

	it("Can authenticate a user", async () => {
		const response = await service.authenticate(loginDto);

		expect(response).toBeInstanceOf(UserEntity);
		expect(response.id).toEqual(entity.id);
		expect(response.password).toEqual(loginDto.password);

		await expect(wasLogged(TEST_NAME, `${className}: Authenticating a user`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it("Throws when unable to find a user to authenticate", async () => {
		const dto = MockCreateLoginDto.get();
		dto.password = randomUUID();

		await expect(service.authenticate(dto)).rejects.toThrow(`${service.constructor.name}: Authentication failed. User not found.`);
		await expect(wasLogged(TEST_NAME, `${className}: Authenticating a user`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it("Can find a user by a JTI", async () => {
		const found = await service.findUserByCookie(mockPlainTextBearerToken);

		expect(found).toBeInstanceOf(UserEntity);
		expect(found.password).toEqual(entity.password);

		await expect(wasLogged(TEST_NAME, `${className}: Finding user for JWT ${mockPlainTextBearerToken.jti}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it("Throws when unable to find a user by JTI", async () => {
		const token = mockPlainTextBearerToken;
		token.jti = randomUUID();

		await expect(service.findUserByCookie(mockPlainTextBearerToken)).rejects.toThrow(
			`${AuthService.name}: Token with JTI ${mockPlainTextBearerToken.jti} not found.`,
		);
		await expect(wasLogged(TEST_NAME, `${className}: Finding user for JWT ${mockPlainTextBearerToken.jti}`)).resolves.toBe(true);
	});

	// --------------------------------------------------

	it("Throws when unable to find a refresh token by SUB", async () => {
		await userRepo.remove(entity);

		await expect(service.findUserByCookie(mockPlainTextBearerToken)).rejects.toThrow(
			`${AuthService.name}: User with UUID ${mockPlainTextBearerToken.sub} not found.`,
		);
		await expect(wasLogged(TEST_NAME, `${className}: Finding user for JWT ${mockPlainTextBearerToken.jti}`)).resolves.toBe(true);
	});
});
