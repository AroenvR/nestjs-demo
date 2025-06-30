import { createMockAppModule } from "../../../__tests__/mocks/module/createMockAppModule";
import { CacheManagerAdapter } from "./CacheManagerAdapter";
import { UtilityModule } from "../UtilityModule";
import { INestApplication } from "@nestjs/common";

const TEST_NAME = "CacheManagerAdapter";
describe(TEST_NAME, () => {
	process.env.TEST_NAME = TEST_NAME;

	let app: INestApplication;

	let cache: CacheManagerAdapter;

	beforeAll(async () => {
		app = await createMockAppModule(UtilityModule);
		cache = app.get<CacheManagerAdapter>(CacheManagerAdapter);
	});

	afterEach(async () => {
		await cache.clear();
	});

	afterAll(async () => {
		await app.close();
	});

	// --------------------------------------------------

	it("Should be defined", async () => {
		expect(cache).toBeDefined();
	});

	// --------------------------------------------------

	it("Set and get returns stored value", async () => {
		await cache.set("foo", "bar");
		const result = await cache.get<string>("foo");

		expect(result).toBe("bar");
	});

	// --------------------------------------------------

	it("setMultiple stores multiple keys", async () => {
		const entries = [
			{ key: "m1", value: "v1" },
			{ key: "m2", value: "v2", ttl: 1000 },
		];
		await cache.setMultiple(entries);

		expect(await cache.get("m1")).toBe("v1");
		expect(await cache.get("m2")).toBe("v2");
	});

	// --------------------------------------------------

	it("Del removes the key", async () => {
		await cache.set("toBeDeleted", 42);
		await cache.del("toBeDeleted");

		const result = await cache.get<number>("toBeDeleted");

		expect(result).toBeUndefined();
	});

	// --------------------------------------------------

	it("Clear removes all keys", async () => {
		await cache.set("a", "1");
		await cache.set("b", "2");
		await cache.clear();

		expect(await cache.get("a")).toBeUndefined();
		expect(await cache.get("b")).toBeUndefined();
	});

	// --------------------------------------------------

	it("Should remove key after custom TTL expires", async () => {
		await cache.set("shortLived", "tempValue", 50);
		expect(await cache.get<string>("shortLived")).toBe("tempValue");

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(await cache.get("shortLived")).toBeUndefined();
	});

	// --------------------------------------------------

	it("Returns undefined on getting a missing key", async () => {
		const result = await cache.get("nonexistent");
		expect(result).toBeUndefined();
	});

	// --------------------------------------------------

	it("get handles underlying cache errors gracefully", async () => {
		// simulate an error in the underlying cache.get()
		const underlyingCache = (cache as any).cache as any;
		jest.spyOn(underlyingCache, "get").mockRejectedValue(new Error("cache failure"));

		const result = await cache.get("errorKey");
		expect(result).toBeUndefined();
	});
});
