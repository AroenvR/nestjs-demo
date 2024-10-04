import { InjectRepository } from '@nestjs/typeorm';
import { AbstractCrudService } from '../abstract/AbstractCrudService';
import { EntityManager, Repository } from 'typeorm';
import { TemplateEntity } from './entities/TemplateEntity';
import { LogAdapter } from '../logging/LogAdapter';
import { CreateTemplateDto } from './dto/CreateTemplateDto';
import { UpdateTemplateDto } from './dto/UpdateTemplateDto';
import { HttpException, HttpStatus } from '@nestjs/common';

export class TemplateService extends AbstractCrudService {
	constructor(
		@InjectRepository(TemplateEntity)
		protected readonly repository: Repository<TemplateEntity>,
		protected readonly entityManager: EntityManager,
		protected readonly logAdapter: LogAdapter,
	) {
		super(repository, entityManager, logAdapter);
	}

	/*  Below is a fully functional Service-Repository-Database relationship.
        Without any implementation, the AbstractService will simply throw "NOT_IMPLEMENTED" errors.  */

	/**
	 *
	 */
	public async create(createDto: CreateTemplateDto) {
		this.logger.info(`Creating a new entity`);

		const template = new TemplateEntity(createDto);
		return this.entityManager.save(template);
	}

	/**
	 *
	 */
	public async findAll() {
		this.logger.info(`Finding all entities`);
		return this.repository.find();
	}

	/**
	 *
	 */
	public async findOne(id: number) {
		this.logger.info(`Finding entity with id ${id}`);

		const template = await this.repository.findOneBy({ id });
		if (!template) throw new HttpException(`Entity by id ${id} not found`, HttpStatus.NOT_FOUND);

		return template;
	}

	/**
	 *
	 */
	public async update(id: number, updateDto: UpdateTemplateDto) {
		this.logger.info(`Updating entity with id ${id}`);

		const template = await this.repository.findOneBy({ id });
		if (!template) throw new HttpException(`Entity by id ${id} not found`, HttpStatus.NOT_FOUND);

		template.value = updateDto.value;
		return this.entityManager.save(template);
	}

	/**
	 *
	 */
	public async remove(id: number) {
		this.logger.info(`Deleting entity with id ${id}`);

		const template = await this.repository.findOneBy({ id });
		if (!template) throw new HttpException(`Entity by id ${id} not found`, HttpStatus.NOT_FOUND);

		await this.repository.delete({ id });
	}
}
