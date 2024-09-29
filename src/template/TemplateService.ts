import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from '../abstract/AbstractService';
import { EntityManager, Repository } from 'typeorm';
import { TemplateEntity } from './entities/TemplateEntity';
import { LogAdapter } from '../logging/LogAdapter';

@Injectable()
export class TemplateService extends AbstractService {
	constructor(
		@InjectRepository(TemplateEntity)
		protected readonly repository: Repository<TemplateEntity>,
		protected readonly entityManager: EntityManager,
		protected readonly logAdapter: LogAdapter,
	) {
		super(repository, entityManager, logAdapter);
	}

	/* Below is a fully functional Service-Repository-Database relationship, simply uncomment it and edit as necessary. */

	// async create(createDto: CreateTemplateDto) {
	//     this.logger.info(`Creating a new entity`);

	//     const template = new TemplateEntity(createDto);
	//     return this.entityManager.save(template);
	// }

	// async findAll() {
	//     this.logger.info(`Finding all entities`);
	//     return this.repository.find();
	// }

	// async findOne(id: number) {
	//     this.logger.info(`Finding entity with id ${id}`);
	//     return this.repository.findOneBy({ id });
	// }

	// async update(id: number, updateDto: UpdateTemplateDto) {
	//     this.logger.info(`Updating entity with id ${id}`);

	//     const template = await this.repository.findOneBy({ id });
	//     if (!template) throw new HttpException(`Entity by id ${id} not found`, HttpStatus.NOT_FOUND);

	//     // Use setters to update the entity
	//     // template.value = updateDto.value;

	//     return this.entityManager.save(template);
	// }

	// async remove(id: number) {
	//     this.logger.info(`Deleting entity with id ${id}`);
	//     await this.repository.delete({ id });
	// }
}
