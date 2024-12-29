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
			const entity = new UserEntity(createDto);

			return entityManager.save(entity);
		});

		return UserResponseDto.fromEntity(transaction);
	}

	/**
	 *
	 */
	public async findAll() {
		this.logger.info(`Finding all entities`);

		const data = await this.repository.find();
		const entities = data.map((entity) => new UserEntity(entity)); // Validate the data

		return entities.map((entity) => UserResponseDto.fromEntity(entity));
	}

	/**
	 *
	 */
	public async findOne(id: number) {
		this.logger.info(`Finding entity by id ${id}`);

		const data = await this.repository.findOneBy({ id });

		if (!data) throw new NotFoundException(`Entity by id ${id} not found`);
		const entity = new UserEntity(data); // Validate the data

		return UserResponseDto.fromEntity(entity);
	}

	/**
	 *
	 */
	public async update(id: number, updateDto: UpdateUserDto) {
		this.logger.info(`Updating entity by id ${id}`);

		const transaction = await this.entityManager.transaction(async (entityManager: EntityManager) => {
			const data = await this.repository.findOneBy({ id });
			if (!data) throw new NotFoundException(`Entity by id ${id} not found`);

			const entity = new UserEntity(data); // Validate the data
			entity.update(updateDto);

			return entityManager.save(entity);
		});

		return UserResponseDto.fromEntity(transaction);
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

		const entity = new UserEntity(data); // Validate the data
		this.events.next({ data: UserResponseDto.fromEntity(entity) });
	}
}
