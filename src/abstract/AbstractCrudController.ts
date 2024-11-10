// import { BadRequestException, Body, Param, ParseIntPipe, UseFilters, UseGuards } from '@nestjs/common';
// import { LogAdapter } from '../infrastructure/logging/LogAdapter';
// import { AbstractCrudService } from './AbstractCrudService';
// import { AbstractLoggingClass } from './AbstractLoggingClass';
// import { ICrudController } from './ICrudController';
// import { NotFoundExceptionFilter } from '../common/filters/NotFoundExceptionFilter';
// import { BadRequestExceptionFilter } from '../common/filters/BadRequestExceptionFilter';
// import { QueryFailedErrorFilter } from '../common/filters/QueryFailedErrorFilter';
// import { HttpExceptionFilter } from '../common/filters/HttpExceptionFilter';
// import { NotImplementedExceptionFilter } from '../common/filters/NotImplementedExceptionFilter';
// import { UnauthorizedExceptionFilter } from '../common/filters/UnauthorizedExceptionFilter';
// import { PassportJwtAuthGuard } from '../common/guards/PassportJwtAuthGuard';
// import { AbstractCrudEntity } from './AbstractCrudEntity';
// import { AbstractCreateDto } from './AbstractCreateDto';
// import { AbstractUpdateDto } from './AbstractUpdateDto';
// import { ApiSecurity } from '@nestjs/swagger';
// import { Observable } from 'rxjs';
// import { ISseMessage } from './ISseMessage';
// import { isTruthy } from 'ts-istruthy';

// /**
//  * An abstract controller class that provides basic CRUD operations.
//  * This class is meant to be extended by other controllers.
//  * It has:
//  * - A configured logger
//  * - HTTP-only Cookie JWT Guard
//  * - Preset error/exception filters
//  */
// @UseFilters(
// 	// NOTE: Remember to add an ApiResponse decorator when adding new response codes at src/decorators/DefaultErrorDecorators.ts
// 	BadRequestExceptionFilter,
// 	HttpExceptionFilter,
// 	NotFoundExceptionFilter,
// 	NotImplementedExceptionFilter,
// 	QueryFailedErrorFilter,
// 	UnauthorizedExceptionFilter,
// )
// @UseGuards(PassportJwtAuthGuard)
// @ApiSecurity('jwt')
// export abstract class AbstractCrudController<
// 		Entity extends AbstractCrudEntity,
// 		CreateDto extends AbstractCreateDto,
// 		UpdateDto extends AbstractUpdateDto,
// 	>
// 	extends AbstractLoggingClass
// 	implements ICrudController<Entity, CreateDto, UpdateDto>
// {
// 	constructor(
// 		protected readonly logAdapter: LogAdapter,
// 		protected readonly service: AbstractCrudService<Entity, CreateDto, UpdateDto>,
// 	) {
// 		super(logAdapter);
// 	}

// 	/**
// 	 *
// 	 */
// 	public async create(@Body() createDto: CreateDto): Promise<Entity> {
// 		if (!isTruthy(createDto)) throw new BadRequestException(`${this.constructor.name}: Create payload is empty.`);

// 		this.logger.info(`Creating a new entity`);
// 		return this.service.create(createDto);
// 	}

// 	/**
// 	 *
// 	 */
// 	public async findAll(): Promise<Entity[]> {
// 		this.logger.info(`Finding all entities`);
// 		return this.service.findAll();
// 	}

// 	/**
// 	 *
// 	 */
// 	public events(): Observable<ISseMessage<Entity>> {
// 		this.logger.log(`Client subscribed to events publishing`);
// 		return this.service.observe();
// 	}

// 	/**
// 	 *
// 	 */
// 	public async findOne(@Param('id', ParseIntPipe) id: number): Promise<Entity> {
// 		this.logger.info(`Finding entity with id ${id}`);
// 		return this.service.findOne(id);
// 	}

// 	/**
// 	 *
// 	 */
// 	public async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateDto): Promise<Entity> {
// 		if (!isTruthy(updateDto)) throw new BadRequestException(`${this.constructor.name}: Update payload is empty.`);

// 		this.logger.info(`Updating entity with id ${id}`);
// 		return this.service.update(id, updateDto);
// 	}

// 	/**
// 	 *
// 	 */
// 	public async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
// 		this.logger.info(`Deleting entity with id ${id}`);
// 		await this.service.remove(id);
// 	}
// }
