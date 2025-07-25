import { UUID } from "crypto";
import { filter } from "rxjs/operators";
import { EntityManager, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Inject, NotFoundException } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { UserEntity } from "../../../domain/user/UserEntity";
import { CreateUserDto } from "../../../http_api/dtos/user/CreateUserDto";
import { UserResponseDto } from "../../../http_api/dtos/user/UserResponseDto";
import { UpdateUserDto } from "../../../http_api/dtos/user/UpdateUserDto";
import { AbstractService } from "../AbstractService";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";
import { CacheManagerAdapter } from "../../../common/utility/cache/CacheManagerAdapter";
import { CacheKeys } from "../../../common/enums/CacheKeys";
import { IAccessCookie, IBearerToken } from "../../../common/interfaces/JwtInterfaces";

/**
 * A service class that provides basic CRUD operations for the UserEntity.
 * Extends the {@link AbstractService} class and implements the required CRUD operations.
 */
export class UserService extends AbstractService<UserEntity> {
	constructor(
		@InjectRepository(UserEntity)
		protected readonly repository: Repository<UserEntity>,
		protected readonly entityManager: EntityManager,
		protected readonly logAdapter: WinstonAdapter,
		@Inject(CacheManagerAdapter)
		protected readonly cache: CacheManagerAdapter,
	) {
		super(repository, entityManager, logAdapter);
	}

	/**
	 *
	 */
	public async create(createDto: CreateUserDto) {
		this.logger.info(`Creating a new entity`);

		// TODO: Hash the password before saving it
		const entity = UserEntity.create(createDto);

		const transaction = await this.entityManager.transaction(async (entityManager: EntityManager) => {
			return entityManager.save(entity);
		});

		await this.cache.set(CacheKeys.USER_UUID + transaction.uuid, transaction.uuid, 5 * 60 * 1000);
		return UserEntity.create(transaction);
	}

	/**
	 *
	 */
	public async findAll() {
		this.logger.info(`Finding all entities`);

		const data = await this.repository.find({
			relations: [],
		});

		return data.map((entity) => UserEntity.create(entity));
	}

	/**
	 *
	 */
	public async findOne(uuid: UUID) {
		this.logger.info(`Finding entity by uuid ${uuid}`);

		const data = await this.repository.findOne({
			where: { uuid: uuid },
			relations: [],
		});

		if (!data) throw new NotFoundException(`Entity by uuid ${uuid} not found`);
		return UserEntity.create(data);
	}

	/**
	 *
	 */
	public async update(uuid: UUID, updateDto: UpdateUserDto) {
		this.logger.info(`Updating entity by uuid ${uuid}`);

		const data = await this.repository.findOne({
			where: { uuid: uuid },
			relations: [],
		});
		if (!data) throw new NotFoundException(`Entity by uuid ${uuid} not found`);

		const entity = UserEntity.create(data); // Validate the data
		entity.update(updateDto);

		const transaction = await this.entityManager.transaction(async (entityManager: EntityManager) => {
			return entityManager.save(entity);
		});

		return UserEntity.create(transaction);
	}

	/**
	 *
	 */
	public async remove(uuid: UUID) {
		this.logger.info(`Deleting entity by uuid ${uuid}`);

		const data = await this.repository.findOneBy({ uuid: uuid });
		if (!data) throw new NotFoundException(`Entity by uuid ${uuid} not found`);

		await this.cache.del(CacheKeys.USER_UUID + data.uuid);
		await this.repository.remove(data);
	}

	/**
	 *
	 */
	public async observe(jwt: IBearerToken | IAccessCookie) {
		this.logger.info(`Observing events`);

		return this.events.pipe(
			filter((message) => {
				const { authenticated, receiverUuid } = message;

				// Event doesn't need authentication
				if (!authenticated) return true;

				// Message is intended for a specific user
				if (receiverUuid) return jwt.sub === receiverUuid;

				// No target = don't broadcast
				return false;
			}),
		);
	}

	/**
	 *
	 */
	public async emit(data: UserEntity) {
		this.logger.info(`Emitting entity by uuid: ${data.uuid}`);

		try {
			const entity = UserEntity.create(data); // Validate the data
			this.events.next({
				authenticated: false, // !!! REMEMBER TO CHANGE THIS WHEN NECESSARY !!!
				receiverUuid: entity.uuid,
				data: UserResponseDto.create(entity),
			});
		} catch (err) {
			this.logger.error(`Failed to emit entity.`, err);
		}
	}

	/**
	 *
	 */
	public async onModuleInit() {
		this.logger.info(`Module requires data seeding. Checking if data needs to be seeded.`);

		const seedRequirement = (await this.repository.count()) === 0;
		if (!seedRequirement) {
			this.logger.info(`Seed data exists. Not seeding data.`);
			await this.hydrateUserUuidsCache(); // TODO: improve
			return;
		}

		const dataToSeed = await this.createSeedData();

		this.logger.info(`Created ${dataToSeed.length} seeds.`);
		await this.repository.save(dataToSeed);

		await this.hydrateUserUuidsCache();
	}

	/**
	 * Every 5 minutes, hydrate cache with all user UUIDs.
	 */
	@Cron(CronExpression.EVERY_5_MINUTES)
	public async hydrateUserUuidsCache() {
		this.logger.log("Hydrating user UUIDs cache");

		const existingUuids = await this.repository.find({
			select: ["uuid"],
		});

		const entries = existingUuids.map((user) => ({
			key: CacheKeys.USER_UUID + user.uuid,
			value: user.uuid,
			ttl: 5 * 60 * 1000, // 5 minutes
		}));
		await this.cache.setMultiple(entries);

		this.logger.log(`Hydrated ${entries.length} user UUIDs into cache`);
	}

	/**
	 * Helper function for onModuleInit to create seed data.
	 */
	private async createSeedData() {
		this.logger.info(`Creating seed data.`);
		const seedData: UserEntity[] = [];

		const admin = UserEntity.create({ username: "admin", password: "administrator" });
		seedData.push(admin);

		return seedData;
	}
}
