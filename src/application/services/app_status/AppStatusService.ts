import { Subject } from "rxjs";
import { CronJob } from "cron";
import { Injectable, OnApplicationBootstrap, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TAppStatusMessage } from "../../../common/types/TAppStatusMessage";
import { AppStatusResponseDto } from "../../../http_api/dtos/app_status/AppStatusResponseDto";
import { IServerConfig } from "../../../infrastructure/configuration/IServerConfig";
import { WinstonAdapter } from "../../../common/utility/logging/adapters/WinstonAdapter";
import { ILogger } from "../../../common/utility/logging/ILogger";
import { SchedulerRegistry } from "@nestjs/schedule";

/**
 * A service class that handles and publishes application status messages.
 * It provides methods to observe and emit status messages, and manages the periodic publishing of these messages.
 * It implements the OnApplicationBootstrap and OnApplicationShutdown interfaces to manage the lifecycle of the service.
 */
@Injectable()
export class AppStatusService implements OnApplicationBootstrap, OnModuleDestroy {
	public readonly name: string;
	private readonly CRON_JOB_NAME = "AppStatusPublishCronJob";
	protected logger: ILogger;
	protected readonly events = new Subject<{ data: AppStatusResponseDto }>();
	private _status: TAppStatusMessage = "starting";

	constructor(
		protected readonly logAdapter: WinstonAdapter,
		protected readonly configService: ConfigService<IServerConfig>,
		private readonly schedulerRegistry: SchedulerRegistry,
	) {
		this.name = this.constructor.name;
		this.logger = logAdapter.getPrefixedLogger(this.name);
	}

	/**
	 * Lifecycle hook that runs when the application starts.
	 * It sets up a cron job to periodically publish the application status.
	 * The interval for publishing is configured in the application settings.
	 */
	public async onApplicationBootstrap() {
		this.logger.info("Starting periodic status message publishing.");

		const intervalMs = this.configService.get<IServerConfig["misc"]>("misc").appStatusInterval;
		const appStatusIntervalSeconds = Math.floor(intervalMs / 1000);
		const cronExpression = `*/${appStatusIntervalSeconds} * * * * *`; // Runs every `interval` seconds

		const cronJob = new CronJob(cronExpression, () => {
			this.emit(this.status);
		});

		this.schedulerRegistry.addCronJob(this.CRON_JOB_NAME, cronJob);
		cronJob.start();

		await this.setStatusAndEmit("listening");
	}

	/**
	 * Lifecycle hook that runs when the application is shutting down.
	 * It stops the cron job that publishes the application status messages.
	 * It also sets the status to "stopping" and emits this status.
	 */
	public async onModuleDestroy() {
		this.logger.info("Stopping periodic status message publishing.");

		const job = this.schedulerRegistry.getCronJob(this.CRON_JOB_NAME);
		await job.stop();

		await this.setStatusAndEmit("stopping");
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
			// @ts-expect-error: todo
			this.events.next({ data: message });
		} catch (err) {
			this.logger.error(`Error while emitting application status: ${err}`);
		}
	}

	/**
	 * Gets the current status of the application.
	 * @returns The current status as a TAppStatusMessage.
	 */
	public getCurrentStatus() {
		this.logger.debug(`Returning application status: "${this.status}".`);
		return this.status;
	}

	/**
	 * Sets the application status and emits the new status message.
	 * @param status The new status to set, of type TAppStatusMessage.
	 * @returns A promise that resolves when the status has been set and emitted.
	 */
	public async setStatusAndEmit(status: TAppStatusMessage) {
		this.logger.debug(`Application status changing from "${this.status}" to: "${status}".`);

		this.status = status;
		await this.emit(status);
	}

	/* Getters & Setters */

	private get status(): TAppStatusMessage {
		return this._status;
	}

	private set status(status: TAppStatusMessage) {
		this._status = status;
	}
}
