import { AbstractExternalFacade } from "./AbstractExternalFacade";
import { ExternalCrudService } from "../services/ExternalCrudService";
import { ExternalEventConsumer } from "../events/ExternalEventConsumer";
import { ConfigService } from "@nestjs/config";
import { ILogger, IPrefixedLogger } from "../../infrastructure/logging/ILogger";
import { IServerConfig } from "../../infrastructure/configuration/IServerConfig";

// A concrete subclass for testing
class TestFacade extends AbstractExternalFacade {
	public loginData!: { endpoint: string; credentials: object };
	public config!: any;

	processSeverSentEvent = jest.fn();

	getEventsUrl(): URL {
		const baseUrl = this.getApiUrl();
		return new URL("/events", baseUrl);
	}

	handleLoginResponse(response: any): string {
		return response.token;
	}

	protected get configSelector(): keyof IServerConfig {
		// @ts-expect-error: foo.bar doesn't exist on in the server config object.
		return "foo.bar";
	}
}

describe("AbstractExternalFacade", () => {
	let facade: TestFacade;
	let service: jest.Mocked<ExternalCrudService>;
	let consumer: jest.Mocked<ExternalEventConsumer>;
	let configService: jest.Mocked<ConfigService<IServerConfig>>;
	let logger: jest.Mocked<ILogger>;

	beforeEach(() => {
		// Mock logger
		logger = {
			debug: jest.fn(),
			verbose: jest.fn(),
			info: jest.fn(),
			log: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
			critical: jest.fn(),
			correlationManager: {
				runWithCorrelationId: jest.fn((id, cb) => cb()),
			},
		} as any;

		const logAdapter: IPrefixedLogger = {
			getPrefixedLogger: jest.fn().mockReturnValue(logger),
		} as any;

		// Mock ConfigService
		configService = {
			get: jest.fn().mockReturnValue({
				ssl: false,
				domain: "api.test",
				port: 8080,
				events: false,
			}),
		} as any;

		// Mock ExternalCrudService
		service = {
			setConfig: jest.fn(),
			setAccessToken: jest.fn(),
			get: jest.fn(),
			post: jest.fn(),
			patch: jest.fn(),
			delete: jest.fn(),
		} as any;

		// Mock ExternalEventConsumer
		consumer = {
			setup: jest.fn(),
			connect: jest.fn(),
			setAccessToken: jest.fn(),
		} as any;

		facade = new TestFacade(logAdapter, configService, service, consumer);
	});

	// --------------------------------------------------

	it("should be defined", () => {
		expect(facade).toBeDefined();
	});

	// --------------------------------------------------

	describe("login()", () => {
		it("performs login flow and sets access token without events", async () => {
			// Prepare login response builder
			const loginResponse = { token: "abc123" };
			const loginBuilder = { execute: jest.fn().mockResolvedValue(loginResponse) } as any;
			service.post.mockReturnValue(loginBuilder);

			await facade.login("/login", { user: "u", pass: "p" });

			expect(logger.log).toHaveBeenCalledWith("Logging in to the external API.");
			expect(configService.get).toHaveBeenCalledWith("foo.bar");
			expect(service.setConfig).toHaveBeenCalledWith({ ssl: false, domain: "api.test", port: 8080, events: false });
			expect(service.post).toHaveBeenCalledWith("/login", { user: "u", pass: "p" });
			expect(loginBuilder.execute).toHaveBeenCalled();
			expect((facade as any).accessToken).toBe("abc123");
			expect(service.setAccessToken).toHaveBeenCalledWith("abc123");
			expect(consumer.setup).not.toHaveBeenCalled();
		});

		// --------------------------------------------------

		it("initializes event consuming when events enabled", async () => {
			// Enable events in config
			configService.get.mockReturnValue({ ssl: false, domain: "api.test", port: 8080, events: true });
			// Prepare login response
			const loginResponse = { token: "evt-token" };
			const loginBuilder = { execute: jest.fn().mockResolvedValue(loginResponse) } as any;
			service.post.mockReturnValue(loginBuilder);
			// Spy on getEventsUrl and handler
			const url = new URL("http://example.com/events");
			jest.spyOn(facade, "getEventsUrl").mockReturnValue(url);
			const handler = facade.processSeverSentEvent;

			await facade.login("/login", { user: "u", pass: "p" });

			expect(service.setConfig).toHaveBeenCalledWith({ ssl: false, domain: "api.test", port: 8080, events: true });
			expect(consumer.setup).toHaveBeenCalledWith(url, handler);
			expect(consumer.connect).toHaveBeenCalled();
		});

		// --------------------------------------------------

		it("throws if event consumer setup fails", async () => {
			configService.get.mockReturnValue({ ssl: false, domain: "api.test", port: 8080, events: true });
			const loginBuilder = { execute: jest.fn().mockResolvedValue({ token: "t" }) } as any;
			service.post.mockReturnValue(loginBuilder);
			consumer.setup.mockImplementation(() => {});
			consumer.connect.mockRejectedValue(new Error("fail-consume"));

			await expect(facade.login("/login", { user: "u", pass: "p" })).rejects.toThrow(
				"TestFacade: Failed to set up event consuming: Error: fail-consume",
			);
		});
	});

	// --------------------------------------------------

	describe("CRUD methods", () => {
		beforeEach(() => {
			(facade as any).accessToken = "initial";
			(facade as any).loginData = { endpoint: "/login", credentials: {} };
			service.setAccessToken.mockClear();
		});

		// --------------------------------------------------

		// CRUD_CASES.forEach(({ method, args }) => {
		const args = ["/endpoint"];

		it(`GET should return response when ok`, async () => {
			const resultObj = { ok: true, data: `get-data` };
			const builder = { execute: jest.fn().mockResolvedValue(resultObj) } as any;
			(service as any).get().mockReturnValue(builder);

			const result = await (facade as any).get(...args);
			expect((service as any).get).toHaveBeenCalledWith(...args);
			expect(builder.execute).toHaveBeenCalled();
			expect(result).toEqual(resultObj);
		});

		// --------------------------------------------------

		it(`GET should retry on 401 and return null`, async () => {
			const builder = { execute: jest.fn().mockResolvedValueOnce({ ok: false, status: 401 }) } as any;
			(service as any).get().mockReturnValue(builder);

			// Mock login flow via service.post
			const loginBuilder = { execute: jest.fn().mockResolvedValue({ token: "new-token" }) } as any;
			service.post.mockReturnValue(loginBuilder);

			const result = await (facade as any).get(...args);
			expect(builder.execute).toHaveBeenCalledTimes(1);
			expect(service.post).toHaveBeenCalledWith("/login", {});
			expect(result).toBeNull();
		});
		// });
	});
});
