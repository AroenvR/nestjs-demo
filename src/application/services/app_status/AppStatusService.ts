import { Subject } from "rxjs";
import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TAppStatusMessage } from "../../../common/types/TAppStatusMessage";
import { AppStatusResponseDto } from "../../../http_api/dtos/app_status/AppStatusResponseDto";
import { IServerConfig } from "../../../infrastructure/configuration/IServerConfig";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";
import { ILogger } from "../../../infrastructure/logging/ILogger";

/**
 * A service class that handles and publishes application status messages.
 * It provides methods to observe and emit status messages, and manages the periodic publishing of these messages.
 * It implements the OnApplicationBootstrap and OnApplicationShutdown interfaces to manage the lifecycle of the service.
 */
@Injectable()
export class AppStatusService implements OnApplicationBootstrap, OnApplicationShutdown {
	public readonly name: string;
	protected logger: ILogger;
	protected readonly events = new Subject<{ data: AppStatusResponseDto }>();
	private intervalId: NodeJS.Timeout | null = null;
	private _status: TAppStatusMessage;

	constructor(
		protected readonly logAdapter: WinstonAdapter,
		protected readonly configService: ConfigService<IServerConfig>,
	) {
		this._status = "starting";

		this.name = this.constructor.name;
		this.logger = logAdapter.getPrefixedLogger(this.name);
	}

	/**
	 *
	 */
	public onApplicationBootstrap() {
		this.logger.info("Starting periodic status message publishing.");
		this.startStatusMessages();
	}

	/**
	 *
	 */
	public onApplicationShutdown() {
		this.logger.info("Stopping periodic status message publishing.");

		this.status = "stopping";
		if (this.intervalId) clearInterval(this.intervalId);
	}

	/**
	 *
	 */
	public async observe() {
		this.logger.info("Observing application status events.");
		return this.events.asObservable();
	}

	/**
	 *
	 */
	public async emit(message: TAppStatusMessage) {
		try {
			this.events.next({ data: AppStatusResponseDto.create(message) });
		} catch (err) {
			this.logger.error(`Error while emitting application status: ${err}`);
		}
	}

	/**
	 * Starts the periodic status message publishing.
	 */
	private startStatusMessages() {
		if (this.intervalId) {
			this.logger.warn("Status message interval already running. Skipping start.");
			return;
		}

		this.status = "listening";
		const interval = this.configService.get<IServerConfig["misc"]>("misc").appStatusInterval;

		this.intervalId = setInterval(() => {
			this.emit(this.status);
		}, interval); // Emit status every 10 seconds

		this.logger.info("Periodic status message publishing started.");
	}

	/**
	 * Gets the current status of the application.
	 * @returns The current status as a TAppStatusMessage.
	 */
	public getCurrentStatus() {
		this.logger.debug(`Returning application status: "${this.status}".`);
		return this.status;
	}

	/* Getters & Setters */

	private get status(): TAppStatusMessage {
		if (!this._status) return "error";
		return this._status;
	}

	private set status(status: TAppStatusMessage) {
		this.logger.debug(`Application status changing from "${this.status}" to: "${status}".`);

		this._status = status;
		this.emit(status);
	}
}
