import { Controller } from '@nestjs/common';
import { AbstractCrudController } from '../abstract/AbstractCrudController';
import { LogAdapter } from '../logging/LogAdapter';
import { TemplateService } from './TemplateService';
import { ApiTags } from '@nestjs/swagger';
import { TemplateEntity } from './entity/TemplateEntity';
import { CreateTemplateDto } from './dto/CreateTemplateDto';
import { UpdateTemplateDto } from './dto/UpdateTemplateDto';
import { PostEndpoint } from '../decorators/PostEndpoint';
import { GetEndpoint } from '../decorators/GetEndpoint';
import { GetByIdEndpoint } from '../decorators/GetByIdEndpoint';
import { PatchEndpoint } from '../decorators/PatchEndpoint';
import { DeleteEndpoint } from '../decorators/DeleteEndpoint';
import { SseEndpoint } from '../decorators/SseEndpoint';

const ENDPOINT = 'template';

// NOTE: Endpoint ordering is important for NestJS to correctly resolve the routes
@Controller(ENDPOINT)
@ApiTags(ENDPOINT)
export class TemplateController extends AbstractCrudController<TemplateEntity, CreateTemplateDto, UpdateTemplateDto> {
	constructor(
		protected readonly logAdapter: LogAdapter,
		protected readonly service: TemplateService,
	) {
		super(logAdapter, service);
	}

	@PostEndpoint(ENDPOINT, TemplateEntity)
	public async create(createDto: CreateTemplateDto) {
		return super.create(createDto);
	}

	@GetEndpoint(ENDPOINT, TemplateEntity)
	public async findAll() {
		return super.findAll();
	}

	@SseEndpoint(ENDPOINT, TemplateEntity)
	public events() {
		return super.events();
	}

	@GetByIdEndpoint(ENDPOINT, TemplateEntity)
	public async findOne(id: number) {
		return super.findOne(id);
	}

	@PatchEndpoint(ENDPOINT, TemplateEntity)
	public async update(id: number, updateDto: UpdateTemplateDto) {
		return super.update(id, updateDto);
	}

	@DeleteEndpoint(ENDPOINT)
	public async remove(id: number) {
		return super.remove(id);
	}
}
