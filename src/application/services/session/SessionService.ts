import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { SessionEntity } from '../../../domain/session/SessionEntity';
import { CreateSessionDto } from '../../../http_api/dtos/session/CreateSessionDto';
import { SessionResponseDto } from '../../../http_api/dtos/session/SessionResponseDto';
import { UpdateSessionDto } from '../../../http_api/dtos/session/UpdateSessionDto';
import { AbstractService } from '../AbstractService';
import { WinstonAdapter } from '../../../infrastructure/logging/adapters/WinstonAdapter';
import { UserEntity } from '../../../domain/user/UserEntity';

/**
 * A service class that provides basic CRUD operations for the SessionEntity.
 * Extends the {@link AbstractService} class and implements the required CRUD operations.
 */
export class SessionService extends AbstractService<CreateSessionDto, UpdateSessionDto, SessionResponseDto> {
	constructor(
		@InjectRepository(SessionEntity)
		protected readonly repository: Repository<SessionEntity>,
		@InjectRepository(UserEntity)
		protected readonly userRepo: Repository<UserEntity>,
		protected readonly entityManager: EntityManager,
		protected readonly logAdapter: WinstonAdapter,
	) {
		super(repository, entityManager, logAdapter);
	}

	/**
	 *
	 */
	public async create(createDto: CreateSessionDto) {
		this.logger.info(`Creating a new entity`);

		// Adjust this to your domain logic
		const user = await this.userRepo.findOne({ where: { password: createDto.password } });
		if (!user) throw new NotFoundException(`User to create session for was not found`);

		const jwt = await this.fetchLongLivedJwt();

		await this.entityManager.transaction(async (entityManager: EntityManager) => {
			const entity = SessionEntity.create({ userUuid: user.uuid, longLivedJwt: jwt, refreshes: 0 });

			return entityManager.save(entity);
		});

		return SessionResponseDto.create(user);
	}

	/**
	 *
	 */
	public async update(id: number, updateDto: UpdateSessionDto) {
		this.logger.info(`Updating entity by id ${id}`);

		const data = await this.repository.findOne({ where: { id: id } });
		if (!data) throw new NotFoundException(`Entity by id ${id} not found`);

		const user = await this.userRepo.findOne({ where: { uuid: data.userUuid } });
		if (!user) throw new NotFoundException(`User for session ${id} not found`);

		await this.entityManager.transaction(async (entityManager: EntityManager) => {
			const entity = SessionEntity.create(data);
			entity.refreshJwt(updateDto.jwt);

			return entityManager.save(entity);
		});

		return SessionResponseDto.create(user);
	}

	/**
	 *
	 */
	public async remove(id: number) {
		this.logger.info(`Deleting entity by id ${id}`);

		const data = await this.repository.findOneBy({ id });
		if (!data) throw new NotFoundException(`Entity by id ${id} not found`);

		await this.repository.remove(data);
	}

	/**
	 * Fetches a long-lived JWT for the session.
	 * @returns A long-lived JWT string.
	 */
	private async fetchLongLivedJwt() {
		return 'Not a valid JWT'; // Implementation detail per your requirements.
	}
}
