import { BadRequestException, Body, Param, ParseIntPipe, UseFilters, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiSecurity } from '@nestjs/swagger';
import { isTruthy } from 'ts-istruthy';
import { BadRequestExceptionFilter } from '../../common/filters/BadRequestExceptionFilter';
import { HttpExceptionFilter } from '../../common/filters/HttpExceptionFilter';
import { NotFoundExceptionFilter } from '../../common/filters/NotFoundExceptionFilter';
import { NotImplementedExceptionFilter } from '../../common/filters/NotImplementedExceptionFilter';
import { QueryFailedErrorFilter } from '../../common/filters/QueryFailedErrorFilter';
import { UnauthorizedExceptionFilter } from '../../common/filters/UnauthorizedExceptionFilter';
import { PassportJwtAuthGuard } from '../../common/guards/PassportJwtAuthGuard';
import { LogAdapter } from '../../infrastructure/logging/LogAdapter';
import { AbstractService } from '../services/AbstractService';
import { CreateDto } from '../dtos/CreateDto';
import { UpdateDto } from '../dtos/UpdateDto';
import { ResponseDto } from '../dtos/ResponseDto';
import { ISseMessage } from '../events/ISseMessage';
import { ILogger } from '../../infrastructure/logging/ILogger';

/**
 * An abstract controller class that provides basic CRUD operations.
 * This class is meant to be extended by other CRUD controllers.
 * It has:
 * - A configured logger
 * - HTTP-only Cookie JWT Guard
 * - Preset error/exception filters
 */
@UseFilters(
	// NOTE: Remember to add an ApiResponse decorator when adding new response codes at src/decorators/DefaultErrorDecorators.ts
	BadRequestExceptionFilter,
	HttpExceptionFilter,
	NotFoundExceptionFilter,
	NotImplementedExceptionFilter,
	QueryFailedErrorFilter,
	UnauthorizedExceptionFilter,
)
@UseGuards(PassportJwtAuthGuard)
@ApiSecurity('jwt')
export class GuardedController {
	protected logger: ILogger;

	constructor(
		protected readonly logAdapter: LogAdapter,
		protected readonly service: AbstractService<CreateDto, UpdateDto, ResponseDto>,
	) {
		this.logger = this.logAdapter.getPrefixedLogger(this.constructor.name);
	}

	/**
	 * Creates a new entity.
	 * @returns A {@link ResponseDto} payload.
	 * @devnote Remember to decorate with the {@link PostEndpoint} decorator.
	 */
	public async create(@Body() createDto: CreateDto): Promise<ResponseDto> {
		if (!isTruthy(createDto)) throw new BadRequestException(`${this.constructor.name}: Create payload is empty.`);

		this.logger.info(`Creating a new entity`);
		return this.service.create(createDto);
	}

	/**
	 * Retrieves all entities from the service.
	 * @returns An array of {@link ResponseDto} payloads.
	 * @devnote Remember to decorate with the {@link GetEndpoint} decorator.
	 */
	public async findAll(): Promise<ResponseDto[]> {
		this.logger.info(`Finding all entities`);
		return this.service.findAll();
	}

	/**
	 * Subscribes to the service's {@link Observable} event stream.
	 * @returns An Observable that emits {@link ISseMessage} objects containing {@link ResponseDto}'s.
	 * @devnote Remember to decorate with the {@link SseEndpoint} decorator.
	 */
	public events(): Observable<ISseMessage<ResponseDto>> {
		this.logger.log(`Client subscribed to events publishing`);
		return this.service.observe();
	}

	/**
	 * Retrieves a single entity from the service by its id.
	 * @param id The id of the entity to find.
	 * @returns A {@link ResponseDto} payload.
	 * @devnote Remember to decorate with the {@link GetByIdEndpoint} decorator.
	 */
	public async findOne(@Param('id', ParseIntPipe) id: number): Promise<ResponseDto> {
		this.logger.info(`Finding entity by id ${id}`);
		return this.service.findOne(id);
	}

	/**
	 * Updates an entity by its id.
	 * @param id The id of the entity to update.
	 * @param updateDto An {@link UpdateDto} object that represents the entity to be updated.
	 * @returns A {@link ResponseDto} payload.
	 * @devnote Remember to decorate with the {@link PatchEndpoint} decorator.
	 */
	public async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateDto): Promise<ResponseDto> {
		if (!isTruthy(updateDto)) throw new BadRequestException(`${this.constructor.name}: Update payload is empty.`);

		this.logger.info(`Updating entity by id ${id}`);
		return this.service.update(id, updateDto);
	}

	/**
	 * Removes an entity by its id.
	 * @param id The id of the entity to remove.
	 * @devnote Remember to decorate with the {@link DeleteEndpoint} decorator.
	 */
	public async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
		this.logger.info(`Deleting entity by id ${id}`);
		await this.service.remove(id);
	}
}
