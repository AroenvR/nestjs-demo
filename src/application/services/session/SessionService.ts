import { randomUUID, UUID } from 'crypto';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { SessionEntity } from '../../../domain/session/SessionEntity';
import { CreateSessionDto } from '../../../http_api/dtos/session/CreateSessionDto';
import { SessionResponseDto } from '../../../http_api/dtos/session/SessionResponseDto';
import { WinstonAdapter } from '../../../infrastructure/logging/adapters/WinstonAdapter';
import { UserEntity } from '../../../domain/user/UserEntity';
import { ILogger } from '../../../infrastructure/logging/ILogger';

/**
 * A service class that provides basic CRUD operations for the SessionEntity.
 */
export class SessionService {
	protected logger: ILogger;

	constructor(
		@InjectRepository(SessionEntity)
		protected readonly repository: Repository<SessionEntity>,
		@InjectRepository(UserEntity)
		protected readonly userRepo: Repository<UserEntity>,
		protected readonly entityManager: EntityManager,
		protected readonly logAdapter: WinstonAdapter,
	) {
		this.logger = logAdapter.getPrefixedLogger(this.constructor.name);
	}

	/**
	 *
	 */
	public async create(createDto: CreateSessionDto) {
		this.logger.info(`Creating a new entity`);

		// Adjust this to your domain logic
		const user = await this.userRepo.findOne({ where: { password: createDto.password } });
		if (!user) throw new NotFoundException(`User to create session for was not found`);

		try {
			await this.exists(user.uuid);

			this.logger.info(`Session already exists for user uuid ${user.uuid}`);
			return this.update(user.uuid);
		} catch (err) {
			// Swallowing the error since we know it doesn't exist
			this.logger.info(`Session does not yet exist for user uuid ${user.uuid}:`, err);
		}

		const token = await this.fetchToken();

		await this.entityManager.transaction(async (entityManager: EntityManager) => {
			const entity = SessionEntity.create({ userUuid: user.uuid, token: token, refreshes: 0 });

			return entityManager.save(entity);
		});

		return SessionResponseDto.create(user);
	}

	/**
	 *
	 */
	public async update(uuid: UUID) {
		this.logger.info(`Updating entity for user uuid ${uuid}`);

		const user = await this.userRepo.findOne({ where: { uuid: uuid } });
		if (!user) throw new NotFoundException(`User by uuid ${uuid} not found`);

		const session = await this.repository.findOne({ where: { userUuid: user.uuid } });
		if (!session) throw new NotFoundException(`Session for user uuid ${user.uuid} not found`);

		await this.entityManager.transaction(async (entityManager: EntityManager) => {
			const entity = SessionEntity.create(session);

			const token = await this.fetchToken();
			entity.refreshToken(token);

			return entityManager.save(entity);
		});

		return SessionResponseDto.create(user);
	}

	/**
	 *
	 */
	public async remove(uuid: UUID) {
		this.logger.info(`Deleting entity for user uuid ${uuid}`);

		const user = await this.userRepo.findOne({ where: { uuid: uuid } });
		if (!user) throw new NotFoundException(`User by uuid ${uuid} not found`);

		const session = await this.repository.findOne({ where: { userUuid: user.uuid } });
		if (!session) throw new NotFoundException(`Session for user uuid ${user.uuid} not found`);

		await this.repository.remove(session);
	}

	/**
	 * Checks if a session exists for the given user UUID.
	 * @param uuid The UUID of the user.
	 * @returns A boolean indicating whether the session exists.
	 */
	public async exists(uuid: UUID): Promise<boolean> {
		this.logger.info(`Checking for an existing session for user uuid ${uuid}`);

		const user = await this.userRepo.findOne({ where: { uuid: uuid } });
		if (!user) throw new NotFoundException(`User by uuid ${uuid} not found`);

		const session = await this.repository.findOne({ where: { userUuid: uuid } });
		if (!session) throw new NotFoundException(`Session for user uuid ${user.uuid} not found`);

		return true;
	}

	/**
	 * Fetches a token for the session.
	 * @returns A token string.
	 */
	private async fetchToken() {
		this.logger.info(`Fetching token for session.`);

		return randomUUID(); // Implementation detail per your requirements.
	}
}
