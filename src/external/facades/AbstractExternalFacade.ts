import { Injectable, Scope } from "@nestjs/common";
import { ILogger, IPrefixedLogger } from "../../infrastructure/logging/ILogger";
import { ExternalCrudService } from "../services/ExternalCrudService";
import { ExternalEventConsumer } from "../events/ExternalEventConsumer";
import { ConfigService } from "@nestjs/config";
import { IServerConfig } from "../../infrastructure/configuration/IServerConfig";
import { IExternalConfig } from "../IExternalConfig";
import { IExternalFacade } from "./IExternalFacade";

/**
 * test & doc
 * Singleton object
 */
@Injectable({ scope: Scope.DEFAULT })
export abstract class AbstractExternalFacade implements IExternalFacade {
	private accessToken: string | null = null;
	protected readonly name: string;
	protected readonly logger: ILogger;
	protected config: IExternalConfig;

	constructor(
		protected readonly logAdapter: IPrefixedLogger,
		protected readonly configService: ConfigService<IServerConfig>,
		protected readonly service: ExternalCrudService,
		protected readonly consumer: ExternalEventConsumer,
	) {
		this.name = this.constructor.name;
		this.logger = logAdapter.getPrefixedLogger(this.name);
	}

	/**
	 *
	 */
	public abstract processSeverSentEvent(data: unknown): Promise<void>;

	/**
	 *
	 */
	public abstract getEventsUrl(): URL;

	/**
	 *
	 */
	public abstract handleLoginResponse(response: unknown): string;

	/**
	 *
	 */
	public async login(endpoint: string, credentials: object): Promise<void> {
		this.logger.log(`Logging in to the external API.`);

		this.config = this.configService.get(this.configSelector);
		this.service.setConfig(this.config);

		const response = await this.service.post(endpoint, credentials);
		this.accessToken = this.handleLoginResponse(response);

		this.service.setAccessToken(this.accessToken);

		if (!this.config.events) return;

		this.consumer.setAccessToken(this.accessToken);
		try {
			this.consumer.setup(this.getEventsUrl(), this.processSeverSentEvent);
			await this.consumer.connect();
		} catch (err) {
			throw new Error(`${this.name}: Failed to set up event consuming: ${err}`);
		}
	}

	/**
	 *
	 */
	public async get(endpoint: string) {
		return this.service.get(endpoint);
	}

	/**
	 *
	 */
	public async post(endpoint: string, payload: string | object | ArrayBuffer) {
		return this.service.post(endpoint, payload);
	}

	/**
	 *
	 */
	public async patch(endpoint: string, payload: string | object | ArrayBuffer) {
		return this.service.patch(endpoint, payload);
	}

	/**
	 *
	 */
	public async delete(endpoint: string) {
		return this.service.delete(endpoint);
	}

	/**
	 * Get the base external API's base URL.
	 */
	protected getApiUrl(): URL {
		const protocol = this.config.ssl ? "https://" : "http://";
		const domain = this.config.domain;
		const port = this.config.port ? `:${this.config.port}` : "";

		return new URL(protocol + domain + port + "/");
	}

	/* Getters & Setters */

	protected abstract get configSelector(): keyof IServerConfig;
}
