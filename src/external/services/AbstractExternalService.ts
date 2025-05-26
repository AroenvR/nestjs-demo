import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ILogger, IPrefixedLogger } from "../../infrastructure/logging/ILogger";
import { IServerConfig } from "../../infrastructure/configuration/IServerConfig";
import { RequestBuilder } from "../../common/utility/request_builder/RequestBuilder";

/**
 * AbstractExternalService is an abstract class that provides a template for
 * services handling communication with an external API.
 * It is meant to be extended by other service classes that handle specific requests.
 */
@Injectable()
export abstract class AbstractExternalService {
	protected readonly name: string;
	protected logger: ILogger;

	constructor(
		protected readonly logAdapter: IPrefixedLogger,
		protected readonly requestBuilder: RequestBuilder,
		protected readonly configService: ConfigService<IServerConfig>,
	) {
		this.name = this.constructor.name;
		this.logger = this.logAdapter.getPrefixedLogger(this.name);
	}

	/**
	 * Get the full URL of the external service's API endpoint.
	 */
	public abstract getApiUrl(): string;

	/**
	 * Log in to the external service.
	 */
	public abstract login(): Promise<string>;

	/**
	 * Handles the event data received from the external service.
	 * @param data The event data to handle.
	 */
	public abstract handleEvent(_: unknown): Promise<void>;

	/* Getters & Setters */

	/**
	 * Get the configuration object for the external service.
	 */
	public abstract get config(): Record<string, unknown>;
}
