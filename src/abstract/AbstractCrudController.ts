import { Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode } from '@nestjs/common';
import { ObjectLiteral } from 'typeorm';
import { LogAdapter } from '../logging/LogAdapter';
import { AbstractCrudService } from './AbstractCrudService';
import { AbstractLoggingClass } from './AbstractLoggingClass';
import { ICrudController } from './ICrudController';
// import { PassportJwtAuthGuard } from '../auth/guards/PassportJwtAuthGuard'; // TODO: Fix

/**
 * An abstract controller class that provides basic CRUD operations.
 */
export abstract class AbstractCrudController extends AbstractLoggingClass implements ICrudController {
	constructor(
		protected readonly logAdapter: LogAdapter,
		protected readonly service: AbstractCrudService,
	) {
		super(logAdapter);
	}

	/**
	 *
	 */
	@Post()
	@HttpCode(HttpStatus.CREATED)
	// @UseGuards(PassportJwtAuthGuard)
	public async create(@Body() createDto: ObjectLiteral) {
		this.logger.info(`Creating a new entity`);
		return this.service.create(createDto);
	}

	/**
	 *
	 */
	@Get()
	@HttpCode(HttpStatus.OK)
	// @UseGuards(PassportJwtAuthGuard)
	public async findAll() {
		this.logger.info(`Finding all entities`);
		return this.service.findAll();
	}

	/**
	 *
	 */
	@Get(':id')
	@HttpCode(HttpStatus.OK)
	// @UseGuards(PassportJwtAuthGuard)
	public async findOne(@Param('id') id: string) {
		this.logger.info(`Finding entity with id ${id}`);
		return this.service.findOne(+id);
	}

	/**
	 *
	 */
	@Patch(':id')
	@HttpCode(HttpStatus.OK)
	// @UseGuards(PassportJwtAuthGuard)
	public async update(@Param('id') id: string, @Body() updateDto: ObjectLiteral) {
		this.logger.info(`Updating entity with id ${id}`);
		return this.service.update(+id, updateDto);
	}

	/**
	 *
	 */
	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	// @UseGuards(PassportJwtAuthGuard)
	public async remove(@Param('id') id: string) {
		this.logger.info(`Deleting entity with id ${id}`);
		await this.service.remove(+id);
	}
}
