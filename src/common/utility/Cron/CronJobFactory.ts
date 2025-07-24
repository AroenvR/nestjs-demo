import { Injectable } from "@nestjs/common";
import { CronJob } from "cron";
import { SchedulerRegistry } from "@nestjs/schedule";
import { WinstonAdapter } from "../logging/adapters/WinstonAdapter";
import { ILogger } from "../logging/ILogger";

/**
 * A factory to create and register cron jobs with NestJS's SchedulerRegistry.
 */
@Injectable()
export class CronJobFactory {
	public readonly name: string;
	protected readonly logger: ILogger;

	constructor(
		protected readonly schedulerRegistry: SchedulerRegistry,
		protected readonly logAdapter: WinstonAdapter,
	) {
		this.name = this.constructor.name;
		this.logger = logAdapter.getPrefixedLogger(this.name);
	}

	/**
	 * Creates a new CronJob instance.
	 * @param expression - The cron expression
	 * @param callback - The function to execute
	 */
	public create(expression: string, callback: () => void): CronJob {
		return new CronJob(expression, callback);
	}

	/**
	 * Creates and registers a new cron job with the SchedulerRegistry.
	 * @param name - A unique identifier for the job
	 * @param expression - The cron expression
	 * @param callback - The function to execute
	 */
	public createAndRegister(name: string, expression: string, callback: () => void): CronJob {
		this.logger.info(`Registering and starting Cron job ${name}`);
		const job = this.create(expression, callback);

		this.schedulerRegistry.addCronJob(name, job);

		job.start();
		return job;
	}

	/**
	 * Stops and removes a previously registered cron job by name.
	 */
	public async remove(name: string): Promise<void> {
		this.logger.info(`Removing and stopping Cron job ${name}`);
		const job = this.schedulerRegistry.getCronJob(name);
		await job.stop();

		this.schedulerRegistry.deleteCronJob(name);
		return;
	}
}
