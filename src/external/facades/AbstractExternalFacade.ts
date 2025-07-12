// import { Injectable, Scope } from "@nestjs/common";
// import { ILogger, IPrefixedLogger } from "../../infrastructure/logging/ILogger";
// import { ExternalCrudService } from "../services/ExternalCrudService";
// import { ExternalEventConsumer } from "../events/ExternalEventConsumer";
// import { ConfigService } from "@nestjs/config";
// import { IServerConfig } from "../../infrastructure/configuration/IServerConfig";
// import { IExternalConfig } from "../IExternalConfig";
// import { IExternalFacade } from "./IExternalFacade";
// import { IBaseRequestBuilder } from "../../common/utility/request_builder/RequestBuilder";

// /**
//  * test & doc
//  * Singleton object
//  */
// @Injectable({ scope: Scope.DEFAULT })
// export abstract class AbstractExternalFacade implements IExternalFacade {
// 	private accessToken: string | null = null;
// 	protected readonly name: string;
// 	protected readonly logger: ILogger;
// 	protected config: IExternalConfig;
// 	protected loginData: { endpoint: string; credentials: object };

// 	constructor(
// 		protected readonly logAdapter: IPrefixedLogger,
// 		protected readonly configService: ConfigService<IServerConfig>,
// 		protected readonly service: ExternalCrudService,
// 		protected readonly consumer: ExternalEventConsumer,
// 	) {
// 		this.name = this.constructor.name;
// 		this.logger = logAdapter.getPrefixedLogger(this.name);
// 	}

// 	/**
// 	 *
// 	 */
// 	public abstract processSeverSentEvent(data: unknown): Promise<void>;

// 	/**
// 	 *
// 	 */
// 	public abstract getEventsUrl(): URL;

// 	/**
// 	 *
// 	 */
// 	public abstract handleLoginResponse(response: unknown): string;

// 	/**
// 	 *
// 	 */
// 	public async login(endpoint: string, credentials: object): Promise<void> {
// 		this.logger.log(`Logging in to the external API.`);
// 		this.loginData = { endpoint: endpoint, credentials: credentials };

// 		this.config = this.configService.get(this.configSelector);
// 		this.service.setConfig(this.config);

// 		const request = this.service.post(endpoint, credentials, this.service.defaultRequestHeaders(), "text");
// 		const response = await request.execute();
// 		const accessToken = this.handleLoginResponse(response);
// 		this.setAccessToken(accessToken);

// 		if (!this.config.events) return;
// 		try {
// 			this.consumer.registerCallback(this.getEventsUrl(), this.processSeverSentEvent);
// 			await this.consumer.connect();
// 		} catch (err) {
// 			throw new Error(`${this.name}: Failed to set up event consuming: ${err}`);
// 		}
// 	}

// 	/**
// 	 *
// 	 */
// 	public async get(endpoint: string) {
// 		const request = this.service.get(endpoint);
// 		return this.executeRequest(request);
// 	}

// 	/**
// 	 *
// 	 */
// 	public async post(endpoint: string, payload: string | object | ArrayBuffer) {
// 		const request = this.service.post(endpoint, payload);
// 		return this.executeRequest(request);
// 	}

// 	/**
// 	 *
// 	 */
// 	public async patch(endpoint: string, payload: string | object | ArrayBuffer) {
// 		const request = this.service.patch(endpoint, payload);
// 		return this.executeRequest(request);
// 	}

// 	/**
// 	 *
// 	 */
// 	public async delete(endpoint: string) {
// 		const request = this.service.delete(endpoint);
// 		return this.executeRequest(request);
// 	}

// 	/**
// 	 * doc
// 	 */
// 	protected async executeRequest(request: IBaseRequestBuilder) {
// 		// const currentToken = this.accessToken;

// 		try {
// 			const response = await request.execute();
// 			return response;
// 			// if (response.ok) return response;

// 			// if (response.status === 401) {
// 			// 	const loginRequest = this.service.post(this.loginData.endpoint, this.loginData.credentials);
// 			// 	const loginResponse = loginRequest.execute();
// 			// 	const newToken = this.handleLoginResponse(loginResponse);

// 			// 	if (currentToken === newToken) throw new Error(`${this.name}: Access token was not refreshed.`);
// 			// 	this.setAccessToken(this.accessToken);

// 			// 	request.headers = this.service.defaultRequestHeaders();
// 			// 	const retry = await request.execute();

// 			// 	if (retry.ok) return retry;
// 			// 	throw new Error(`${this.name}: Request RETRY failed.`);
// 			// }
// 		} catch (err) {
// 			this.logger.error(`Request to ${request.domain + "/" + request.endpoint} failed.`, err);
// 			return null;
// 		}
// 	}

// 	/**
// 	 * Get the base external API's base URL.
// 	 */
// 	protected getApiUrl(): URL {
// 		const protocol = this.config.ssl ? "https://" : "http://";
// 		const domain = this.config.domain;
// 		const port = this.config.port ? `:${this.config.port}` : "";

// 		return new URL(protocol + domain + port + "/");
// 	}

// 	/**
// 	 * doc
// 	 * @param token
// 	 */
// 	protected setAccessToken(token: string) {
// 		this.accessToken = token;
// 		this.service.setAccessToken(token);
// 		if (this.config.events) this.consumer.setAccessToken(token);
// 	}

// 	/* Getters & Setters */

// 	protected abstract get configSelector(): keyof IServerConfig;
// }
