// import { BadRequestException, Controller, HttpException, HttpStatus } from '@nestjs/common';
// import { AbstractCrudController } from '../../abstract/AbstractCrudController';
// import { LogAdapter } from '../../infrastructure/logging/LogAdapter';
// import { TemplateService } from '../services/TemplateService';
// import { ApiTags } from '@nestjs/swagger';
// import { TemplateEntity } from '../../domain/entities/TemplateEntity';
// import { CreateTemplateDto } from '../dtos/template/CreateTemplateDto';
// import { UpdateTemplateDto } from '../dtos/template/UpdateTemplateDto';
// import { PostEndpoint } from '../../common/decorators/PostEndpoint';
// import { GetEndpoint } from '../../common/decorators/GetEndpoint';
// import { GetByIdEndpoint } from '../../common/decorators/GetByIdEndpoint';
// import { PatchEndpoint } from '../../common/decorators/PatchEndpoint';
// import { DeleteEndpoint } from '../../common/decorators/DeleteEndpoint';
// import { SseEndpoint } from '../../common/decorators/SseEndpoint';
// import { isTruthy } from 'ts-istruthy';

// const ENDPOINT = 'template';

// // NOTE: Endpoint ordering is important for NestJS to correctly resolve the routes
// @Controller(ENDPOINT)
// @ApiTags(ENDPOINT)
// export class TemplateController extends AbstractCrudController<TemplateEntity, CreateTemplateDto, UpdateTemplateDto> {
// 	constructor(
// 		protected readonly logAdapter: LogAdapter,
// 		protected readonly service: TemplateService,
// 	) {
// 		super(logAdapter, service);
// 	}

// 	@PostEndpoint(ENDPOINT, TemplateEntity)
// 	public async create(createDto: CreateTemplateDto) {
// 		return super.create(createDto);
// 	}

// 	@GetEndpoint(ENDPOINT, TemplateEntity)
// 	public async findAll() {
// 		return super.findAll();
// 	}

// 	@SseEndpoint(ENDPOINT, TemplateEntity)
// 	public events() {
// 		return super.events();
// 	}

// 	@GetByIdEndpoint(ENDPOINT, TemplateEntity)
// 	public async findOne(id: number) {
// 		return super.findOne(id);
// 	}

// 	@PatchEndpoint(ENDPOINT, TemplateEntity)
// 	public async update(id: number, updateDto: UpdateTemplateDto) {
// 		if (!isTruthy(id)) throw new HttpException('ID is empty', HttpStatus.BAD_REQUEST);
// 		if (!isTruthy(updateDto)) throw new HttpException('Payload is empty', HttpStatus.BAD_REQUEST);
// 		return super.update(id, updateDto);
// 	}

// 	@DeleteEndpoint(ENDPOINT)
// 	public async remove(id: number) {
// 		return super.remove(id);
// 	}
// }
