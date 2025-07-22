import { randomUUID } from "crypto";
import { Repository } from "typeorm";
import { INestApplication } from "@nestjs/common";
import { getRepositoryToken } from "@nestjs/typeorm";
import { RefreshTokenEntity } from "./RefreshTokenEntity";
import { MockRefreshTokenEntity } from "../../__tests__/mocks/entity/MockRefreshTokenEntity";
import { copyEntity } from "../../__tests__/mocks/entity/copyEntity";
import { createMockAppModule } from "../../__tests__/mocks/module/createMockAppModule";
import { ApplicationEntities } from "../../common/enums/ApplicationEntities";

describe("RefreshTokenEntity.Integration", () => {
	let app: INestApplication;

	let entity: RefreshTokenEntity;
	let repository: Repository<RefreshTokenEntity>;

	beforeAll(async () => {
		app = await createMockAppModule();
		repository = app.get(getRepositoryToken(RefreshTokenEntity));
	});

	beforeEach(() => {
		entity = MockRefreshTokenEntity.get();
	});

	afterEach(async () => {
		await repository.clear();
	});

	afterAll(async () => {
		await app.close();
	});

	describe("Happy flow", () => {
		it("Can be inserted into the database", async () => {
			const saved = await repository.save(entity);

			expect(saved.id).toEqual(entity.id);
			expect(saved.uuid).toEqual(entity.uuid);
			expect(saved.createdAt).toEqual(entity.createdAt);

			expect(saved.jti).toEqual(entity.jti);
			expect(saved.sub).toEqual(entity.sub);
			expect(saved.hash).toEqual(entity.hash);
			expect(saved.lastRefreshedAt).toBeLessThanOrEqual(Date.now() + 1);
		});

		// --------------------------------------------------

		it("Can be found in the database", async () => {
			const found = await repository.save(entity).then(() => {
				return repository.findOne({ where: { id: entity.id } });
			});

			expect(found.id).toEqual(entity.id);
			expect(found.uuid).toEqual(entity.uuid);
			expect(found.createdAt).toEqual(entity.createdAt);

			expect(found.jti).toEqual(entity.jti);
			expect(found.sub).toEqual(entity.sub);
			expect(found.hash).toEqual(entity.hash);
			expect(found.lastRefreshedAt).toBeLessThanOrEqual(Date.now() + 1);
		});
	});

	// --------------------------------------------------

	describe("Unhappy flow", () => {
		it("JTI cannot be null", async () => {
			entity.jti = null;
			await expect(repository.save(entity)).rejects.toThrow();
		});

		// --------------------------------------------------

		it("JTI must be unique", async () => {
			const saved = await repository.save(entity);
			const copy = copyEntity(saved);
			copy.hash = "z".repeat(44);

			await expect(repository.save(copy)).rejects.toThrow(`UNIQUE constraint failed: ${ApplicationEntities.REFRESH_TOKEN}.jti`);
		});

		// --------------------------------------------------

		it("Sub cannot be null", async () => {
			entity.sub = null;
			await expect(repository.save(entity)).rejects.toThrow();
		});

		// --------------------------------------------------

		it("Hash cannot be null", async () => {
			entity.hash = null;
			await expect(repository.save(entity)).rejects.toThrow();
		});

		// --------------------------------------------------

		it("Hash must be unique", async () => {
			const saved = await repository.save(entity);
			const copy = copyEntity(saved);
			copy.jti = randomUUID();

			await expect(repository.save(copy)).rejects.toThrow(`UNIQUE constraint failed: ${ApplicationEntities.REFRESH_TOKEN}.hash`);
		});

		// --------------------------------------------------

		it("Last refreshed at cannot be null", async () => {
			entity.lastRefreshedAt = null;
			await expect(repository.save(entity)).rejects.toThrow();
		});
	});
});
