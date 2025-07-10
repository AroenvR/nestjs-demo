import request from "supertest";
import jwt from "jsonwebtoken";
import { Controller, Get, HttpCode, HttpStatus, INestApplication, Module, UseGuards } from "@nestjs/common";
import { CompositeAuthGuard } from "./CompositeAuthGuard";
import { createMockAppModule } from "../../__tests__/mocks/module/createMockAppModule";
import { mockBearerToken, mockPlainTextBearerToken } from "../../__tests__/mocks/mockJwt";
import { securityConstants } from "../../common/constants/securityConstants";
import { IBearerToken } from "src/common/interfaces/JwtInterfaces";
import { ConfigService } from "@nestjs/config";
import { UseErrorFilters } from "../decorators/UseErrorFilters";
import { IServerConfig } from "src/infrastructure/configuration/IServerConfig";
import { JwtService } from "@nestjs/jwt";

const ENDPOINT_SUFFIX = "mock";
const MESSAGE = "Hello, World!";

@Controller(ENDPOINT_SUFFIX)
@UseErrorFilters()
@UseGuards(CompositeAuthGuard)
class MockCompositeAuthGuardedController {
	@Get()
	@HttpCode(HttpStatus.OK)
	hello() {
		return MESSAGE;
	}
}

@Module({
	controllers: [MockCompositeAuthGuardedController],
})
class MockModule {}

const TEST_NAME = "CompositeAuthGuard";
describe(TEST_NAME, () => {
	process.env.TEST_NAME = TEST_NAME; // Creates a log file named with this test's name.

	const ENDPOINT = `/v1/${ENDPOINT_SUFFIX}`;

	let app: INestApplication;
	let configService: ConfigService;
	let jwtService: JwtService;

	beforeAll(async () => {
		app = await createMockAppModule(MockModule);
		configService = app.get(ConfigService);
		jwtService = app.get(JwtService);
	});

	afterAll(async () => {
		await app.close();
	});

	// --------------------------------------------------

	it("Should be defined", () => {
		expect(app).toBeDefined();
	});

	// --------------------------------------------------

	it("Can receive requests", async () => {
		const response = await request(app.getHttpServer()).get(ENDPOINT).set("Authorization", `Bearer ${mockBearerToken}`).expect(HttpStatus.OK);
		expect(response.text).toEqual(MESSAGE);
	});

	// --------------------------------------------------

	// TODO: HTTP-Only Cookie tests
	// TODO: Swagger header tests
	// TODO: JWKS tests

	// --------------------------------------------------

	describe("JWT expiration logic in CompositeAuthGuard", () => {
		const secret = process.env[securityConstants.bearerAccessTokenEnvVar] ?? "test_secret";
		const now = Math.floor(Date.now() / 1000);

		let mockToken: IBearerToken;

		beforeEach(() => {
			mockToken = mockPlainTextBearerToken;
		});

		// --------------------------------------------------

		it("Accepts a valid access token", async () => {
			const token = jwt.sign(mockToken, secret);
			const response = await request(app.getHttpServer()).get(ENDPOINT).set("Authorization", `Bearer ${token}`).expect(HttpStatus.OK);

			expect(response.text).toBe(MESSAGE);
		});

		// --------------------------------------------------

		it("Rejects an expired access token using our own 'exp' value", async () => {
			mockToken.exp = now - configService.get<IServerConfig["security"]>("security").bearer.expiry;

			const token = jwt.sign(mockToken, secret);
			await request(app.getHttpServer()).get(ENDPOINT).set("Authorization", `Bearer ${token}`).expect(HttpStatus.UNAUTHORIZED);
		});

		// --------------------------------------------------

		it("Rejects an expired access token using the JwtService's 'expiresIn' value", async () => {
			const { exp, ...tokenWithoutExp } = mockToken;

			const token = await jwtService.signAsync(tokenWithoutExp, {
				secret,
				expiresIn: "-1h", // expired 1 hour ago
			});

			await request(app.getHttpServer()).get(ENDPOINT).set("Authorization", `Bearer ${token}`).expect(HttpStatus.UNAUTHORIZED);
		});

		// --------------------------------------------------

		it("validates exp is interpreted as seconds (not milliseconds)", async () => {
			const now = Math.floor(Date.now() / 1000); // current time in seconds
			const exp = now + 3600; // expires in 1 hour

			mockToken.exp = exp;
			const token = jwt.sign(mockToken, secret);

			jest.useFakeTimers().setSystemTime(now * 1000);

			await request(app.getHttpServer()).get(ENDPOINT).set("Authorization", `Bearer ${token}`).expect(HttpStatus.OK);

			// Advance time by 2 hours (token should now be expired)
			jest.advanceTimersByTime(2 * 60 * 60 * 1000); // 2 hours in ms

			await request(app.getHttpServer()).get(ENDPOINT).set("Authorization", `Bearer ${token}`).expect(HttpStatus.UNAUTHORIZED);

			jest.useRealTimers();
		});
	});
});
