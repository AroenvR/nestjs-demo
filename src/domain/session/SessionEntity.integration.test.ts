import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { SessionEntity } from './SessionEntity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MockSessionEntity } from '../../__tests__/mocks/entity/MockSessionEntity';
import { copyEntity } from '../../__tests__/mocks/entity/copyEntity';
import { createMockAppModule } from '../../__tests__/mocks/module/createMockAppModule';
import { SessionModule } from '../../http_api/modules/session/SessionModule';

describe('SessionEntity Integration', () => {
	let entity: SessionEntity;
	let repository: Repository<SessionEntity>;

	beforeAll(async () => {
		const module = await createMockAppModule(SessionModule);
		repository = module.get(getRepositoryToken(SessionEntity));
	});

	beforeEach(() => {
		entity = MockSessionEntity.get();
	});

	afterEach(async () => {
		await repository.clear();
	});

	// --------------------------------------------------

	describe('Happy flow', () => {
		it('Can be inserted into the database', async () => {
			const saved = await repository.save(entity);

			expect(saved.id).toEqual(entity.id);
			expect(saved.uuid).toEqual(entity.uuid);
			expect(saved.createdAt).toEqual(entity.createdAt);

			expect(saved.userUuid).toEqual(entity.userUuid);
			expect(saved.token).toEqual(entity.token);
			expect(saved.refreshes).toEqual(entity.refreshes);
		});

		// --------------------------------------------------

		it('Can be found in the database', async () => {
			const found = await repository.save(entity).then(() => {
				return repository.findOne({ where: { id: entity.id } });
			});

			expect(found.id).toEqual(entity.id);
			expect(found.uuid).toEqual(entity.uuid);
			expect(found.createdAt).toEqual(entity.createdAt);

			expect(found.userUuid).toEqual(entity.userUuid);
			expect(found.token).toEqual(entity.token);
			expect(found.refreshes).toEqual(entity.refreshes);
		});
	});

	// --------------------------------------------------

	describe('Unhappy flow', () => {
		it('User UUID cannot be null', async () => {
			entity.userUuid = null;
			await expect(repository.save(entity)).rejects.toThrow();
		});

		// --------------------------------------------------

		it('User UUID must be unique', async () => {
			const saved = await repository.save(entity);
			const copy = copyEntity(saved);
			copy.uuid = randomUUID();
			copy.token = 'foobar';

			await expect(repository.save(copy)).rejects.toThrow('UNIQUE constraint failed: session_entity.userUuid');
		});

		// --------------------------------------------------

		it('Token cannot be null', async () => {
			entity.token = null;
			await expect(repository.save(entity)).rejects.toThrow();
		});

		// --------------------------------------------------

		it('Token must be unique', async () => {
			const saved = await repository.save(entity);
			const copy = copyEntity(saved);
			copy.uuid = randomUUID();
			copy.userUuid = randomUUID();

			await expect(repository.save(copy)).rejects.toThrow('UNIQUE constraint failed: session_entity.token');
		});

		// --------------------------------------------------

		it('Refreshes cannot be null', async () => {
			entity.refreshes = null;
			await expect(repository.save(entity)).rejects.toThrow();
		});
	});
});
