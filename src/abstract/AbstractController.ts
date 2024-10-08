import { Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode } from '@nestjs/common';
import { ObjectLiteral } from 'typeorm';
import { ILogger } from 'ts-log-adapter';
import { LogAdapter } from '../logging/LogAdapter';
import { AbstractService } from './AbstractService';

/**
 * An abstract controller class that provides basic CRUD operations.
 */
export abstract class AbstractController {
	protected logger: ILogger;

	constructor(
		protected readonly logAdapter: LogAdapter,
		protected readonly service: AbstractService,
	) {
		const name = this.constructor.name;
		this.logger = this.logAdapter.getPrefixedLogger(name);
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	async create(@Body() createDto: ObjectLiteral) {
		this.logger.info(`Creating a new entity`);
		return this.service.create(createDto);
	}

	@Get()
	@HttpCode(HttpStatus.OK)
	async findAll() {
		this.logger.info(`Finding all entities`);
		return this.service.findAll();
	}

	@Get(':id')
	@HttpCode(HttpStatus.OK)
	async findOne(@Param('id') id: string) {
		this.logger.info(`Finding entity with id ${id}`);
		return this.service.findOne(+id);
	}

	@Patch(':id')
	@HttpCode(HttpStatus.OK)
	async update(@Param('id') id: string, @Body() updateDto: ObjectLiteral) {
		this.logger.info(`Updating entity with id ${id}`);
		return this.service.update(+id, updateDto);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	async remove(@Param('id') id: string) {
		this.logger.info(`Deleting entity with id ${id}`);
		await this.service.remove(+id);
	}
}
