import { InjectRepository } from '@nestjs/typeorm';
import { AbstractCrudService } from '../abstract/AbstractCrudService';
import { EntityManager, Repository } from 'typeorm';
import { TemplateEntity } from './entities/TemplateEntity';
import { LogAdapter } from '../logging/LogAdapter';
import { CreateTemplateDto } from './dto/CreateTemplateDto';
import { UpdateTemplateDto } from './dto/UpdateTemplateDto';
import { NotFoundException } from '@nestjs/common';

export class TemplateService extends AbstractCrudService<TemplateEntity, CreateTemplateDto, UpdateTemplateDto> {
	constructor(
		@InjectRepository(TemplateEntity)
		protected readonly repository: Repository<TemplateEntity>,
		protected readonly entityManager: EntityManager,
		protected readonly logAdapter: LogAdapter,
	) {
		super(repository, entityManager, logAdapter);
	}

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
		if (!template) throw new NotFoundException(`Entity by id ${id} not found`);

		return template;
	}

	/**
	 *
	 */
	public async update(id: number, updateDto: UpdateTemplateDto) {
		this.logger.info(`Updating entity with id ${id}`);

		const template = await this.repository.findOneBy({ id });
		if (!template) throw new NotFoundException(`Entity by id ${id} not found`);

		template.value = updateDto.value;
		return this.entityManager.save(template);
	}

	/**
	 *
	 */
	public async remove(id: number) {
		this.logger.info(`Deleting entity with id ${id}`);

		const template = await this.repository.findOneBy({ id });
		if (!template) throw new NotFoundException(`Entity by id ${id} not found`);

		await this.repository.delete({ id });
	}
}
