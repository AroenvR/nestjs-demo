import { randomUUID } from "crypto";
import { MockRefreshTokenEntity } from "../../__tests__/mocks/entity/MockRefreshTokenEntity";
import { RefreshTokenEntity } from "./RefreshTokenEntity";
import { serverConfig } from "../../infrastructure/configuration/serverConfig";
import { IServerConfig } from "../../infrastructure/configuration/IServerConfig";

describe("RefreshTokenEntity.Unit", () => {
	let config: IServerConfig;
	let data: RefreshTokenEntity;

	beforeEach(() => {
		config = serverConfig();
		data = MockRefreshTokenEntity.get();
	});

	// --------------------------------------------------

	it("Can create itself from a partial object", () => {
		delete data.id;
		delete data.uuid;
		delete data.createdAt;

		const entity = RefreshTokenEntity.create(data);

		expect(entity).toBeInstanceOf(RefreshTokenEntity);
		expect(entity.jti).toEqual(data.jti);
		expect(entity.sub).toEqual(data.sub);
		expect(entity.hash).toEqual(data.hash);
		expect(entity.lastRefreshedAt).toBeLessThanOrEqual(Date.now() + 1);
	});

	// --------------------------------------------------

	it("Can create itself from a full object", () => {
		const entity = RefreshTokenEntity.create(data);

		expect(entity.id).toEqual(data.id);
		expect(entity.uuid).toEqual(data.uuid);
		expect(entity.createdAt).toEqual(data.createdAt);

		expect(entity.jti).toEqual(data.jti);
		expect(entity.sub).toEqual(data.sub);
		expect(entity.hash).toEqual(data.hash);
		expect(entity.lastRefreshedAt).toBeLessThanOrEqual(Date.now() + 1);
	});

	// --------------------------------------------------

	it("Can be refreshed if not throttled and not expired", () => {
		const entity = RefreshTokenEntity.create(data);

		const newJti = randomUUID();
		const newHash = "x".repeat(64);

		const cookieExpiry = config.security.cookie.expiry;
		const tokenExpiry = config.security.bearer.expiry;

		const refreshed = entity.refresh(newJti, newHash, cookieExpiry, tokenExpiry);

		expect(refreshed.jti).toEqual(newJti);
		expect(refreshed.sub).toEqual(data.sub);
		expect(refreshed.hash).toEqual(newHash);
		expect(refreshed.lastRefreshedAt).toBeLessThanOrEqual(Date.now() + 1);
	});

	// --------------------------------------------------

	it("Throws when refreshed too soon", () => {
		const cookieExpiry = config.security.cookie.expiry;
		const tokenExpiry = config.security.bearer.expiry;

		data.lastRefreshedAt = Date.now() - tokenExpiry + 100; // 100 milliseconds too early.
		const entity = RefreshTokenEntity.create(data);

		const newJti = randomUUID();
		const newHash = "x".repeat(64);

		expect(() => entity.refresh(newJti, newHash, cookieExpiry, tokenExpiry)).toThrow("Refreshing too soon.");
	});

	// --------------------------------------------------

	it("Throws when cookie is expired", () => {
		const cookieExpiry = config.security.cookie.expiry;
		const tokenExpiry = config.security.bearer.expiry;

		data.createdAt = Date.now() - cookieExpiry - 5; // 5 milliseconds too late.
		const entity = RefreshTokenEntity.create(data);

		const newJti = randomUUID();
		const newHash = "x".repeat(64);

		expect(() => entity.refresh(newJti, newHash, cookieExpiry, tokenExpiry)).toThrow("Cookie has expired.");
	});

	// --------------------------------------------------

	it("Throws when calling update()", () => {
		const entity = RefreshTokenEntity.create(data);
		expect(() => entity.update({})).toThrow("RefreshTokenEntity: Updating is not allowed.");
	});
});
