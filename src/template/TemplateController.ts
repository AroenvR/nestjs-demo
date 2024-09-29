import { Controller } from '@nestjs/common';
import { AbstractController } from '../abstract/AbstractController';
import { LogAdapter } from '../logging/LogAdapter';
import { TemplateService } from './TemplateService';

@Controller('template')
export class TemplateController extends AbstractController {
	protected readonly name = 'TemplateController';

	constructor(
		protected readonly logAdapter: LogAdapter,
		protected readonly service: TemplateService,
	) {
		super(logAdapter, service);
	}

	/*  This Controller already has fully functional endpoints for:
        - POST
        - GET
        - GET/id
        - PATCH/id
        - DELETE/id */
}
