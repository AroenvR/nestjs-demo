import { Repository } from 'typeorm';
import { UserEntity } from './UserEntity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { serverConfig } from '../../infrastructure/configuration/serverConfig';
import { DatabaseModule } from '../../infrastructure/database/DatabaseModule';

describe('UserEntity_Integration', () => {
	const USERNAME = 'test';
	const PASSWORD = 'testerinobebino';

	let repository: Repository<UserEntity>;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({
					isGlobal: true,
					load: [serverConfig],
				}),
				DatabaseModule,
				TypeOrmModule.forFeature([UserEntity]),
			],
		}).compile();

		repository = module.get(getRepositoryToken(UserEntity));
	});

	afterEach(async () => {
		await repository.clear();
	});

	// --------------------------------------------------

	describe('Happy flow', () => {
		it('Can be inserted into the database', async () => {
			const entity = new UserEntity({ username: USERNAME, password: PASSWORD });
			const saved = await repository.save(entity);

			const found = await repository.findOne({ where: { id: saved.id } });
			expect(saved).toEqual(found);

			expect(saved.username).toEqual(USERNAME);
		});
	});

	// --------------------------------------------------

	describe('Unhappy flow', () => {
		it('Username cannot be null', async () => {
			const entity = new UserEntity({ username: USERNAME, password: PASSWORD });
			entity.username = null;
			await expect(repository.save(entity)).rejects.toThrow();
		});

		// --------------------------------------------------

		it('Username must be unique', async () => {
			const entity = new UserEntity({ username: USERNAME, password: PASSWORD });
			await repository.save(entity);

			const duplicate = new UserEntity({ username: USERNAME, password: PASSWORD });
			await expect(repository.save(duplicate)).rejects.toThrow();
		});
	});
});
