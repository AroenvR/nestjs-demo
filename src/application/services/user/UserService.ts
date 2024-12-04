import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UserEntity } from '../../../domain/entities/user/UserEntity';
import { CreateUserDto } from '../../dtos/user/CreateUserDto';
import { UserResponseDto } from '../../dtos/user/UserResponseDto';
import { UpdateUserDto } from '../../../application/dtos/user/UpdateUserDto';
import { AbstractService } from '../AbstractService';
import { NewWinstonAdapter } from '../../../infrastructure/logging/adapters/NewWinstonAdapter';

/**
 * A service class that provides basic CRUD operations for the UserEntity.
 * Extends the {@link AbstractService} class and implements the required CRUD operations.
 */
export class UserService extends AbstractService<CreateUserDto, UpdateUserDto, UserResponseDto> {
	constructor(
		@InjectRepository(UserEntity)
		protected readonly repository: Repository<UserEntity>,
		protected readonly entityManager: EntityManager,
		protected readonly logAdapter: NewWinstonAdapter,
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

		return UserResponseDto.fromEntity(transaction);
	}

	/**
	 *
	 */
	public async findAll() {
		this.logger.info(`Finding all entities`);

		const data = await this.repository.find();
		const entities = data.map((entity) => UserEntity.create(entity)); // Validate the data

		return entities.map((entity) => UserResponseDto.fromEntity(entity));
	}

	/**
	 *
	 */
	public async findOne(id: number) {
		this.logger.info(`Finding entity by id ${id}`);

		const data = await this.repository.findOneBy({ id });

		if (!data) throw new NotFoundException(`Entity by id ${id} not found`);
		const entity = UserEntity.create(data); // Validate the data

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

			const entity = UserEntity.create(data); // Validate the data
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
	public observe() {
		this.logger.info(`Observing template events`);
		return this.events.asObservable();
	}

	/**
	 *
	 */
	public emit(data: UserEntity) {
		this.logger.info(`Emitting entity by id: ${data.id}`);

		const entity = UserEntity.create(data); // Validate the data
		this.events.next({ data: UserResponseDto.fromEntity(entity) });
	}
}
