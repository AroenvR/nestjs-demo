import PQueue from "p-queue";
import { MaxPriorityQueue } from "@datastructures-js/priority-queue";
import { ConfigService } from "@nestjs/config";
import { IServerConfig } from "../../../infrastructure/configuration/IServerConfig";
import { WinstonAdapter } from "../logging/adapters/WinstonAdapter";
import { TaskOptions } from "p-queue/dist/options";
import { ILogger } from "../logging/ILogger";
import { IPQTaskManager, PQTaskIdentifier, PQTaskOptions } from "./IPQTaskManager";
import { IPQTaskManagerConfig } from "src/infrastructure/configuration/interfaces/tasks/IPQTaskManagerConfig";

/**
 * TODO
 */
interface PQTaskRuntimeMeta {
	taskId: PQTaskIdentifier;
}

/**
 * TODO: Document
 */
export class PQTaskManager implements IPQTaskManager {
	public readonly name: string;
	public readonly config: IPQTaskManagerConfig;
	protected readonly logger: ILogger;
	private _isIdle = true;
	private _isPaused = false;
	private _currentActive = 0;
	private _isShuttingDown = false;
	private readonly queues = new Map<number, PQueue>();
	private readonly priorityHeap = new MaxPriorityQueue<number>();
	private readonly taskMeta = new Map<PQTaskIdentifier, PQTaskRuntimeMeta>();

	constructor(configService: ConfigService<IServerConfig>, logAdapter: WinstonAdapter) {
		this.name = this.constructor.name;
		this.logger = logAdapter.getPrefixedLogger(this.name);
		this.config = configService.getOrThrow<IServerConfig["misc"]>("misc").tasks;
	}

	/**
	 *
	 */
	public async addToQueue<T>(task: (opts?: TaskOptions) => Promise<T>, options?: PQTaskOptions): Promise<T> {
		return;
	}

	/**
	 *
	 */
	public cancel(taskId: string): void {
		return;
	}

	/**
	 *
	 */
	public async shutdown(): Promise<void> {
		return;
	}

	/**
	 *
	 */
	public clearQueues(queueId?: number): void {
		return;
	}

	/**
	 *
	 */
	public getPriorityQueueIds(): number[] {
		return [];
	}

	/**
	 *
	 */
	public getQueueSize(queueId?: number): number {
		if (!queueId) return this.getPriorityQueueIds().length;

		return 1;
	}

	/**
	 *
	 */
	public getActiveCount(queueId?: number): number {
		if (!queueId) return this.currentActive;

		return 0;
	}

	/**
	 *
	 */
	getCurrentRetryCount(taskId?: string): number {
		return 0;
	}

	/**
	 *
	 */
	pauseQueues(): void {
		return;
	}

	/**
	 *
	 */
	resumeQueues(): void {
		return;
	}

	/* Getters & Setters */

	public get isIdle() {
		return this._isIdle;
	}
	protected set isIdle(idle: boolean) {
		this._isIdle = idle;
	}

	public get isPaused() {
		return this._isPaused;
	}
	protected set isPaused(paused: boolean) {
		this._isPaused = paused;
	}

	public get currentActive() {
		return this._currentActive;
	}
	protected set currentActive(amount: number) {
		this._currentActive = amount;
	}

	public get isShuttingDown() {
		return this._isShuttingDown;
	}
	protected set isShuttingDown(shuttingDown: boolean) {
		this._isShuttingDown = shuttingDown;
	}
}
