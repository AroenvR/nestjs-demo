import { Controller, UseGuards } from "@nestjs/common";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";
import { AppStatusService } from "../../../application/services/app_status/AppStatusService";
import { SseEndpoint } from "../../../http_api/decorators/SseEndpoint";
import { UseErrorFilters } from "../../../http_api/decorators/UseErrorFilters";
import { AppStatusResponseDto } from "../../../http_api/dtos/app_status/AppStatusResponseDto";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";
import { ILogger } from "../../../infrastructure/logging/ILogger";
import { GetEndpoint } from "../../../http_api/decorators/GetEndpoint";
import { TransformResponseDto } from "../../../http_api/decorators/TransformResponseDto";
import { CompositeAuthGuard } from "../../guards/CompositeAuthGuard";
import { securityConstants } from "../../../common/constants/securityConstants";
import { AccessCookieAuthGuard } from "../../guards/AccessCookieAuthGuard";

const ENDPOINT = "app_status";

/**
 * A controller class that handles and publishes application status messages.
 * It exposes API endpoints and hands DTO's to the correct services.
 */
@Controller(ENDPOINT)
@ApiTags(ENDPOINT)
@UseErrorFilters()
@UseGuards(CompositeAuthGuard)
@ApiSecurity(securityConstants.swaggerAuthGuardBinding)
@TransformResponseDto(AppStatusResponseDto)
export class AppStatusController {
	protected readonly name: string;
	protected readonly logger: ILogger;

	constructor(
		protected readonly logAdapter: WinstonAdapter,
		protected readonly service: AppStatusService,
	) {
		this.name = this.constructor.name;
		this.logger = this.logAdapter.getPrefixedLogger(this.name);
	}

	/**
	 * Retrieves the current application status.
	 * @returns An {@link AppStatusResponseDto} containing the current status of the application.
	 */
	@GetEndpoint(ENDPOINT, AppStatusResponseDto)
	public async getStatus() {
		this.logger.warn("Client requesting current application status.");
		return this.service.getCurrentStatus();
	}

	/**
	 * Subscribes to application status messages.
	 * @returns An observable stream of application status messages.
	 */
	@SseEndpoint(ENDPOINT, AppStatusResponseDto)
	public events() {
		this.logger.debug("Client subscribing to application status message publishing.");
		return this.service.observe();
	}
}
