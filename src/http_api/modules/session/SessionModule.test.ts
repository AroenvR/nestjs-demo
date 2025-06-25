import request, { Response } from "supertest";
import { Repository } from "typeorm";
import { randomUUID } from "crypto";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { SessionModule } from "./SessionModule";
import { CreateSessionDto } from "../../dtos/session/CreateSessionDto";
import { SessionEntity } from "../../../domain/session/SessionEntity";
import { wasLogged } from "../../../__tests__/helpers/wasLogged";
import { expiredJwt, mockJwt } from "../../../__tests__/mocks/mockJwt";
import { createMockAppModule } from "../../../__tests__/mocks/module/createMockAppModule";
import { MockCreateSessionDto } from "../../../__tests__/mocks/dto/MockSessionDto";
import { UserEntity } from "../../../domain/user/UserEntity";
import { MockUserEntity } from "../../../__tests__/mocks/entity/MockUserEntity";
import { verifyRefreshData } from "./sessionModuleTestingHelper";
import { sessionConstants } from "../../../common/constants/sessionConstants";

const TEST_NAME = "SessionModule";
describe(TEST_NAME, () => {
	process.env.TEST_NAME = TEST_NAME; // Creates a log file named with this test's name.

	const ENDPOINT = "/v1/session";

	let app: INestApplication;
	let userRepo: Repository<UserEntity>;
	let repository: Repository<SessionEntity>;
	let jwtService: JwtService;

	let user: UserEntity;

	let createDto: CreateSessionDto;

	beforeAll(async () => {
		app = await createMockAppModule(SessionModule);
		userRepo = app.get(getRepositoryToken(UserEntity));
		repository = app.get(getRepositoryToken(SessionEntity));
		jwtService = app.get(JwtService);
	});

	beforeEach(async () => {
		createDto = MockCreateSessionDto.get();
		user = await userRepo.save(MockUserEntity.get());
	});

	afterEach(async () => {
		await repository.clear();
	});

	afterAll(async () => {
		await app.close();
	});

	// --------------------------------------------------

	it("Should be defined", () => {
		expect(app).toBeDefined();
	});

	// -------------------------------------------------- \\

	describe("POST /login", () => {
		it("Can create a session with JWT", async () => {
			const response = await request(app.getHttpServer()).post(`${ENDPOINT}/login`).send(createDto).expect(HttpStatus.CREATED);

			expect(response.body.id).toEqual(user.id);
			expect(response.body.uuid).toEqual(user.uuid);
			expect(response.body.createdAt).toEqual(user.createdAt);

			expect(response.body.username).toEqual(user.username);

			expect(response.headers["set-cookie"]).toBeDefined();

			let emptyJwt = true;
			for (const header of response.headers["set-cookie"]) {
				if (header.includes("jwt=ey")) emptyJwt = false;
			}
			expect(emptyJwt).toBe(false);

			await expect(wasLogged(TEST_NAME, `SessionController: Logging a user in`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `SessionController: Creating JWT for user uuid ${user.uuid}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `SessionController: Signing JWT`)).resolves.toBe(true);

			await expect(wasLogged(TEST_NAME, `SessionService: Creating a new entity`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `SessionService: Session does not yet exist for user uuid ${user.uuid}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `SessionService: Fetching token for session`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it("Should return an error without a JWT when missing a payload", async () => {
			const response = await request(app.getHttpServer()).post(`${ENDPOINT}/login`).send({}).expect(HttpStatus.BAD_REQUEST);
			expect(response.headers["set-cookie"]).toBeUndefined();
			await expect(wasLogged(TEST_NAME, `SessionController: Logging a user in`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it("Should return an error without a JWT when sending an invalid payload", async () => {
			createDto.password = "invalidpassword";
			const response = await request(app.getHttpServer()).post(`${ENDPOINT}/login`).send(createDto).expect(HttpStatus.NOT_FOUND);
			expect(response.headers["set-cookie"]).toBeUndefined();
			await expect(wasLogged(TEST_NAME, `SessionController: Logging a user in`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it("Should refresh the JWT and session when a session already exists", async () => {
			const originalResponse = await request(app.getHttpServer()).post(`${ENDPOINT}/login`).send(createDto).expect(HttpStatus.CREATED);

			let originalJwt = "";
			for (const header of originalResponse.headers["set-cookie"]) {
				if (header.includes("jwt=ey")) originalJwt = header;
			}
			expect(originalJwt).toBeDefined();

			const originalSession = await repository.findOne({ where: { userUuid: user.uuid } });
			expect(originalSession).toBeDefined();
			const originalToken = originalSession.token;

			// Try to login again
			const refreshedResponse = await request(app.getHttpServer()).post(`${ENDPOINT}/login`).send(createDto).expect(HttpStatus.CREATED);

			let refreshedJwt = "";
			for (const header of refreshedResponse.headers["set-cookie"]) {
				if (header.includes("jwt=ey")) refreshedJwt = header;
			}
			expect(refreshedJwt).toBeDefined();
			expect(refreshedJwt).not.toEqual(originalJwt);

			const refreshedSession = await repository.findOne({ where: { userUuid: user.uuid } });
			expect(refreshedSession).toBeDefined();
			expect(refreshedSession.token).not.toEqual(originalToken);

			await expect(wasLogged(TEST_NAME, `SessionController: Logging a user in`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `SessionService: Session already exists for user uuid ${user.uuid}`)).resolves.toBe(true);
		});
	});

	// -------------------------------------------------- \\

	describe("PATCH /refresh/:uuid", () => {
		it("Can refresh its session and JWT", async () => {
			const loginResponse: Response = await request(app.getHttpServer()).post(`${ENDPOINT}/login`).send(createDto).expect(HttpStatus.CREATED);
			const loginSession = await repository.findOne({ where: { userUuid: user.uuid } });

			const refreshResponse = await request(app.getHttpServer())
				.patch(`${ENDPOINT}/refresh/${user.uuid}`)
				.set("Cookie", [`jwt=${mockJwt}`])
				.expect(HttpStatus.OK);
			const refreshedSession = await repository.findOne({ where: { userUuid: user.uuid } });

			expect(refreshResponse.body.id).toEqual(user.id);
			expect(refreshResponse.body.uuid).toEqual(user.uuid);
			expect(refreshResponse.body.createdAt).toEqual(user.createdAt);

			expect(refreshResponse.body.username).toEqual(user.username);

			verifyRefreshData(loginResponse, loginSession, refreshResponse, refreshedSession, jwtService);

			await expect(wasLogged(TEST_NAME, `SessionController: Updating session and JWT for user uuid ${user.uuid}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `SessionService: Updating entity for user uuid ${user.uuid}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `SessionController: Creating JWT for user uuid ${user.uuid}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `SessionController: Signing JWT`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it.only("Refreshes the session and JWT when using an expired JWT", async () => {
			const loginResponse = await request(app.getHttpServer()).post(`${ENDPOINT}/login`).send(createDto).expect(HttpStatus.CREATED);
			const loginSession = await repository.findOne({ where: { userUuid: user.uuid } });

			const refreshResponse = await request(app.getHttpServer())
				.patch(`${ENDPOINT}/refresh/${user.uuid}`)
				.set("Cookie", [`jwt=${expiredJwt}`])
				.expect(HttpStatus.OK);
			const refreshedSession = await repository.findOne({ where: { userUuid: user.uuid } });

			verifyRefreshData(loginResponse, loginSession, refreshResponse, refreshedSession, jwtService);

			await expect(wasLogged(TEST_NAME, `SessionController: Updating session and JWT for user uuid ${user.uuid}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `SessionService: Updating entity for user uuid ${user.uuid}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `SessionController: Creating JWT for user uuid ${user.uuid}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `SessionController: Signing JWT`)).resolves.toBe(true);
		});

		// -----------------------------------

		it("Returns a NOT FOUND if no session exists", async () => {
			await request(app.getHttpServer())
				.patch(`${ENDPOINT}/refresh/${user.uuid}`)
				.set("Cookie", [`jwt=${mockJwt}`])
				.expect(HttpStatus.NOT_FOUND);

			await expect(wasLogged(TEST_NAME, `SessionController: Updating session and JWT for user uuid ${user.uuid}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `SessionService: Updating entity for user uuid ${user.uuid}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `NotFoundExceptionFilter: Session for user uuid ${user.uuid} not found`)).resolves.toBe(true);
		});

		// --------------------------------------------------

		it("Should return an error when missing or using a wrong UUID", async () => {
			await request(app.getHttpServer()).post(`${ENDPOINT}/login`).send(createDto).expect(HttpStatus.CREATED);

			await request(app.getHttpServer())
				.patch(`${ENDPOINT}/refresh`)
				.set("Cookie", [`jwt=${mockJwt}`])
				.expect(HttpStatus.NOT_FOUND);

			const uuid = randomUUID();
			await request(app.getHttpServer())
				.patch(`${ENDPOINT}/refresh/${uuid}`)
				.set("Cookie", [`jwt=${mockJwt}`])
				.expect(HttpStatus.NOT_FOUND);

			await expect(wasLogged(TEST_NAME, `SessionController: Updating session and JWT for user uuid ${uuid}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `SessionService: Updating entity for user uuid ${uuid}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `NotFoundExceptionFilter: User by uuid ${uuid} not found`)).resolves.toBe(true);
		});

		// ------------------------------------

		it("Should return UNAUTHORIZED when refreshing without a JWT", async () => {
			await request(app.getHttpServer()).post(`${ENDPOINT}/login`).send(createDto).expect(HttpStatus.CREATED);

			await request(app.getHttpServer()).patch(`${ENDPOINT}/refresh/${user.uuid}`).expect(HttpStatus.UNAUTHORIZED);

			await expect(wasLogged(TEST_NAME, `SessionController: Updating session and JWT for user uuid ${user.uuid}`)).resolves.toBe(true);
		});

		// -----------------------------------

		it("Logs the user out on reaching maximum refreshes", async () => {
			await request(app.getHttpServer()).post(`${ENDPOINT}/login`).send(createDto).expect(HttpStatus.CREATED);

			const loginSession = await repository.findOne({ where: { userUuid: user.uuid } });
			expect(loginSession.refreshes).toEqual(0);

			for (let i = 0; i < sessionConstants.maxRefreshes; i++) {
				await request(app.getHttpServer())
					.patch(`${ENDPOINT}/refresh/${user.uuid}`)
					.set("Cookie", [`jwt=${mockJwt}`])
					.expect(HttpStatus.OK);

				const refreshedSession = await repository.findOne({ where: { userUuid: user.uuid } });
				expect(refreshedSession.refreshes).toEqual(i + 1);
			}

			await request(app.getHttpServer())
				.patch(`${ENDPOINT}/refresh/${user.uuid}`)
				.set("Cookie", [`jwt=${mockJwt}`])
				.expect(HttpStatus.UNAUTHORIZED);

			const refreshedSession = await repository.findOne({ where: { userUuid: user.uuid } });
			expect(refreshedSession).toBeNull();

			await expect(wasLogged(TEST_NAME, `SessionController: Updating session and JWT for user uuid ${user.uuid}`)).resolves.toBe(true);
			await expect(wasLogged(TEST_NAME, `SessionEntity: Maximum refreshes exceeded`)).resolves.toBe(true);
		});
	});

	// -------------------------------------------------- \\

	describe("DELETE /logout", () => {
		describe("With an existing session", () => {
			beforeEach(async () => {
				await request(app.getHttpServer()).post(`${ENDPOINT}/login`).send(createDto).expect(HttpStatus.CREATED);
				expect(repository.findOne({ where: { userUuid: user.uuid } })).resolves.toBeDefined();
			});

			// --------------------------------------------------

			it("Clears the valid JWT and deletes the session", async () => {
				const response = await request(app.getHttpServer())
					.delete(`${ENDPOINT}/logout`)
					.set("Cookie", [`jwt=${mockJwt}`])
					.expect(HttpStatus.NO_CONTENT);

				expect(response.headers["set-cookie"]).toBeDefined();

				let emptyJwt = false;
				for (const header of response.headers["set-cookie"]) {
					if (header.includes("jwt=;")) emptyJwt = true;
				}
				expect(emptyJwt).toBe(true);

				const session = await repository.findOne({ where: { userUuid: user.uuid } });
				expect(session).toBeNull();

				await expect(wasLogged(TEST_NAME, `SessionController: Logging a user out`)).resolves.toBe(true);
				await expect(wasLogged(TEST_NAME, `SessionService: Deleting entity for user uuid ${user.uuid}`)).resolves.toBe(true);
				await expect(wasLogged(TEST_NAME, `SessionController: Logged out user with uuid ${user.uuid}`)).resolves.toBe(true);
			});

			// --------------------------------------------------

			it("Clears the expired JWT and deletes the session", async () => {
				const response = await request(app.getHttpServer())
					.delete(`${ENDPOINT}/logout`)
					.set("Cookie", [`jwt=${expiredJwt}`])
					.expect(HttpStatus.NO_CONTENT);

				expect(response.headers["set-cookie"]).toBeDefined();
				let emptyJwt = false;
				for (const header of response.headers["set-cookie"]) {
					if (header.includes("jwt=;")) emptyJwt = true;
				}

				const session = await repository.findOne({ where: { userUuid: user.uuid } });
				expect(session).toBeNull();

				expect(emptyJwt).toBe(true);
			});

			// --------------------------------------------------

			it("Handles a call without JWT", async () => {
				const response = await request(app.getHttpServer()).delete(`${ENDPOINT}/logout`).expect(HttpStatus.NO_CONTENT);

				expect(response.headers["set-cookie"]).toBeDefined();
				let emptyJwt = false;
				for (const header of response.headers["set-cookie"]) {
					if (header.includes("jwt=;")) emptyJwt = true;
				}
				expect(emptyJwt).toBe(true);

				await expect(wasLogged(TEST_NAME, `SessionController: Missing JWT`)).resolves.toBe(true);
			});
		});

		// --------------------------------------------------

		describe.skip("Without a session", () => {
			it("Clears a valid JWT", async () => {
				const response = await request(app.getHttpServer())
					.delete(`${ENDPOINT}/logout`)
					.set("Cookie", [`jwt=${mockJwt}`])
					.expect(HttpStatus.NO_CONTENT);

				expect(response.headers["set-cookie"]).toBeDefined();

				let emptyJwt = false;
				for (const header of response.headers["set-cookie"]) {
					if (header.includes("jwt=;")) emptyJwt = true;
				}
				expect(emptyJwt).toBe(true);

				await expect(wasLogged(TEST_NAME, `SessionController: Logging a user out`)).resolves.toBe(true);
				await expect(wasLogged(TEST_NAME, `SessionController: Session for user uuid ${user.uuid} does not exist`)).resolves.toBe(true);
				await expect(wasLogged(TEST_NAME, `SessionController: Logged out user with uuid ${user.uuid}`)).resolves.toBe(true);
			});

			// --------------------------------------------------

			it("Clears an expired JWT", async () => {
				const response = await request(app.getHttpServer())
					.delete(`${ENDPOINT}/logout`)
					.set("Cookie", [`jwt=${expiredJwt}`])
					.expect(HttpStatus.NO_CONTENT);

				expect(response.headers["set-cookie"]).toBeDefined();

				let emptyJwt = false;
				for (const header of response.headers["set-cookie"]) {
					if (header.includes("jwt=;")) emptyJwt = true;
				}
				expect(emptyJwt).toBe(true);

				await expect(wasLogged(TEST_NAME, `SessionController: Logging a user out`)).resolves.toBe(true);
				await expect(wasLogged(TEST_NAME, `SessionController: Session for user uuid ${user.uuid} does not exist`)).resolves.toBe(true);
				await expect(wasLogged(TEST_NAME, `SessionController: Logged out user with uuid ${user.uuid}`)).resolves.toBe(true);
			});

			// --------------------------------------------------

			it("Handles a logout call without JWT", async () => {
				const response = await request(app.getHttpServer()).delete(`${ENDPOINT}/logout`).expect(HttpStatus.NO_CONTENT);

				expect(response.headers["set-cookie"]).toBeDefined();
				let emptyJwt = false;
				for (const header of response.headers["set-cookie"]) {
					if (header.includes("jwt=;")) emptyJwt = true;
				}
				expect(emptyJwt).toBe(true);

				await expect(wasLogged(TEST_NAME, `SessionController: Missing JWT`)).resolves.toBe(true);
			});
		});
	});
});
