import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UserEntity } from '../../../domain/user/UserEntity';
import { CreateUserDto } from '../../../http_api/dtos/user/CreateUserDto';
import { UserResponseDto } from '../../../http_api/dtos/user/UserResponseDto';
import { UpdateUserDto } from '../../../http_api/dtos/user/UpdateUserDto';
import { AbstractService } from '../AbstractService';
import { WinstonAdapter } from '../../../infrastructure/logging/adapters/WinstonAdapter';

/**
 * A service class that provides basic CRUD operations for the UserEntity.
 * Extends the {@link AbstractService} class and implements the required CRUD operations.
 */
export class UserService extends AbstractService<CreateUserDto, UpdateUserDto, UserResponseDto> {
	constructor(
		@InjectRepository(UserEntity)
		protected readonly repository: Repository<UserEntity>,
		protected readonly entityManager: EntityManager,
		protected readonly logAdapter: WinstonAdapter,
	) {
		super(repository, entityManager, logAdapter);
	}

	/**
	 *
	 */
	public async create(createDto: CreateUserDto) {
		this.logger.info(`Creating a new entity`);

		const transaction = await this.entityManager.transaction(async (entityManager: EntityManager) => {
			const entity = UserEntity.create(createDto);

			return entityManager.save(entity);
		});

		return UserResponseDto.create(transaction);
	}

	/**
	 *
	 */
	public async findAll() {
		this.logger.info(`Finding all entities`);

		const data = await this.repository.find();
		const entities = data.map((entity) => UserEntity.create(entity)); // Validate the data

		return entities.map((entity) => UserResponseDto.create(entity));
	}

	/**
	 *
	 */
	public async findOne(id: number) {
		this.logger.info(`Finding entity by id ${id}`);

		const data = await this.repository.findOneBy({ id });

		if (!data) throw new NotFoundException(`Entity by id ${id} not found`);
		const entity = UserEntity.create(data); // Validate the data

		return UserResponseDto.create(entity);
	}

	/**
	 *
	 */
	public async update(id: number, updateDto: UpdateUserDto) {
		this.logger.info(`Updating entity by id ${id}`);

		const transaction = await this.entityManager.transaction(async (entityManager: EntityManager) => {
			const data = await this.repository.findOneBy({ id });
			if (!data) throw new NotFoundException(`Entity by id ${id} not found`);

			const entity = UserEntity.create(data); // Validate the data
			entity.update(updateDto);

			return entityManager.save(entity);
		});

		return UserResponseDto.create(transaction);
	}

	/**
	 *
	 */
	public async remove(id: number) {
		this.logger.info(`Deleting entity by id ${id}`);

		const data = await this.repository.findOneBy({ id });
		if (!data) throw new NotFoundException(`Entity by id ${id} not found`);

		await this.repository.delete({ id });
	}

	/**
	 *
	 */
	public async observe() {
		this.logger.info(`Observing template events`);
		return this.events.asObservable();
	}

	/**
	 *
	 */
	public async emit(data: UserEntity) {
		this.logger.info(`Emitting entity by id: ${data.id}`);

		try {
			const entity = UserEntity.create(data); // Validate the data
			this.events.next({ data: UserResponseDto.create(entity) });
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
			this.logger.info(`Seeding requirement not met. Not seeding data.`);
			return;
		}

		const dataToSeed = await this.createSeedData();

		this.logger.info(`Created ${dataToSeed.length} seeds.`);
		await this.repository.save(dataToSeed);
	}

	/**
	 * Helper function for onModuleInit to create seed data.
	 */
	private async createSeedData() {
		this.logger.info(`Creating seed data.`);
		const seedData: UserEntity[] = [];

		const admin = UserEntity.create({ username: 'admin', password: 'administrator' });
		seedData.push(admin);

		return seedData;
	}
}
