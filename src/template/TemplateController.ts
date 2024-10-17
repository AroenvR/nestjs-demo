import { Controller } from '@nestjs/common';
import { AbstractCrudController } from '../abstract/AbstractCrudController';
import { LogAdapter } from '../logging/LogAdapter';
import { TemplateService } from './TemplateService';
import { ApiTags } from '@nestjs/swagger';
import { TemplateEntity } from './entities/TemplateEntity';
import { CreateTemplateDto } from './dto/CreateTemplateDto';
import { UpdateTemplateDto } from './dto/UpdateTemplateDto';
import { PostEndpoint } from '../decorators/PostEndpoint';
import { GetEndpoint } from '../decorators/GetEndpoint';
import { GetByIdEndpoint } from '../decorators/GetByIdEndpoint';
import { PatchEndpoint } from '../decorators/PatchEndpoint';
import { DeleteEndpoint } from '../decorators/DeleteEndpoint';

const ENDPOINT = 'template';

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
	public create(createDto: CreateTemplateDto): Promise<TemplateEntity> {
		return super.create(createDto);
	}

	@GetEndpoint(ENDPOINT, TemplateEntity)
	public findAll(): Promise<TemplateEntity[]> {
		return super.findAll();
	}

	@GetByIdEndpoint(ENDPOINT, TemplateEntity)
	public findOne(id: number): Promise<TemplateEntity> {
		return super.findOne(id);
	}

	@PatchEndpoint(ENDPOINT, TemplateEntity)
	public update(id: number, updateDto: UpdateTemplateDto): Promise<TemplateEntity> {
		return super.update(id, updateDto);
	}

	@DeleteEndpoint(ENDPOINT)
	public remove(id: number): Promise<void> {
		return super.remove(id);
	}
}
