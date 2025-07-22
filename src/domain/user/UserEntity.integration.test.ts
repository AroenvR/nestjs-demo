import { Repository } from "typeorm";
import { UserEntity } from "./UserEntity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { MockUserEntity } from "../../__tests__/mocks/entity/MockUserEntity";
import { copyEntity } from "../../__tests__/mocks/entity/copyEntity";
import { createMockAppModule } from "../../__tests__/mocks/module/createMockAppModule";
import { UserModule } from "../../http_api/modules/user/UserModule";
import { INestApplication } from "@nestjs/common";
import { ApplicationEntities } from "../../common/enums/ApplicationEntities";

describe("UserEntity.Integration", () => {
	let app: INestApplication;

	let entity: UserEntity;
	let repository: Repository<UserEntity>;

	beforeAll(async () => {
		app = await createMockAppModule(UserModule);
		repository = app.get(getRepositoryToken(UserEntity));
	});

	beforeEach(() => {
		entity = MockUserEntity.get();
	});

	afterEach(async () => {
		await repository.clear();
	});

	afterAll(async () => {
		await app.close();
	});

	// --------------------------------------------------

	describe("Happy flow", () => {
		it("Can be inserted into the database", async () => {
			const saved = await repository.save(entity);

			expect(saved.id).toEqual(entity.id);
			expect(saved.uuid).toEqual(entity.uuid);
			expect(saved.createdAt).toEqual(entity.createdAt);

			expect(saved.username).toEqual(entity.username);
			expect(saved.password).toEqual(entity.password);
		});

		// --------------------------------------------------

		it("Can be found in the database", async () => {
			const found = await repository.save(entity).then(() => {
				return repository.findOne({ where: { id: entity.id } });
			});

			expect(found.id).toEqual(entity.id);
			expect(found.uuid).toEqual(entity.uuid);
			expect(found.createdAt).toEqual(entity.createdAt);

			expect(found.username).toEqual(entity.username);
			expect(found.password).toEqual(entity.password);
		});
	});

	// --------------------------------------------------

	describe("Unhappy flow", () => {
		it("Username cannot be null", async () => {
			entity.username = null;
			await expect(repository.save(entity)).rejects.toThrow();
		});

		// --------------------------------------------------

		it("Username must be unique", async () => {
			const saved = await repository.save(entity);
			const copy = copyEntity(saved);

			await expect(repository.save(copy)).rejects.toThrow(`UNIQUE constraint failed: ${ApplicationEntities.USER}.username`);
		});
	});
});
