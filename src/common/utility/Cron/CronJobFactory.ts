import { CronJob } from "cron";
import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { WinstonAdapter } from "../logging/adapters/WinstonAdapter";
import { ILogger } from "../logging/ILogger";

/**
 * A factory to create and register cron jobs with NestJS's SchedulerRegistry.
 * This class manages the lifecycle of cron jobs, allowing for their creation, registration, and removal.
 */
@Injectable()
export class CronJobFactory implements OnModuleDestroy {
	public readonly name: string;
	protected readonly logger: ILogger;
	private readonly jobs: Set<string> = new Set();

	constructor(
		protected readonly schedulerRegistry: SchedulerRegistry,
		protected readonly logAdapter: WinstonAdapter,
	) {
		this.name = this.constructor.name;
		this.logger = logAdapter.getPrefixedLogger(this.name);
	}

	async onModuleDestroy() {
		for (const job of this.jobs.values()) {
			await this.remove(job);
		}
	}

	/**
	 * Creates and registers a new cron job with the SchedulerRegistry.
	 * @param name - A unique identifier for the job
	 * @param expression - The cron expression
	 * @param callback - The function to execute
	 */
	public createAndRegister(name: string, expression: string, callback: () => void): CronJob {
		this.logger.info(`Attempting to register and start Cron job ${name}`);
		if (this.jobs.has(name)) throw new Error(`${this.name}: Duplicate Cron job ${name} being registered`);

		const job = this.create(expression, callback);

		this.schedulerRegistry.addCronJob(name, job);
		this.jobs.add(name);

		job.start();
		return job;
	}

	/**
	 * Creates a new CronJob instance.
	 * @param expression - The cron expression
	 * @param callback - The function to execute
	 */
	private create(expression: string, callback: () => void): CronJob {
		return new CronJob(expression, callback);
	}

	/**
	 * Stops and removes a previously registered cron job by name.
	 */
	private async remove(name: string): Promise<void> {
		this.logger.info(`Removing and stopping Cron job ${name}`);

		const job = this.schedulerRegistry.getCronJob(name);
		await job.stop();

		this.schedulerRegistry.deleteCronJob(name);
		this.jobs.delete(name);

		return;
	}
}
