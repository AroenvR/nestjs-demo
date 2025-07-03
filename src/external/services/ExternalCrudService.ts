import { Injectable } from "@nestjs/common";
import { ILogger } from "../../infrastructure/logging/ILogger";
import { BuilderResponse, RequestBuilder } from "../../common/utility/request_builder/RequestBuilder";
import { IExternalConfig } from "../IExternalConfig";
import { IExternalCrudService } from "./IExternalCrudService";
import { WinstonAdapter } from "../../infrastructure/logging/adapters/WinstonAdapter";

/**
 * DOC
 */
@Injectable()
export class ExternalCrudService implements IExternalCrudService {
	private accessToken: string | null = null;
	protected readonly name: string;
	protected logger: ILogger;
	protected config: IExternalConfig | null = null;

	constructor(
		protected readonly logAdapter: WinstonAdapter,
		protected readonly requestBuilder: RequestBuilder,
	) {
		this.name = this.constructor.name;
		this.logger = this.logAdapter.getPrefixedLogger(this.name);
	}

	/**
	 *
	 */
	public get(endpoint: string, headers?: Record<string, string>, responseType: BuilderResponse = "json") {
		return this.requestBuilder
			.setMethod("GET")
			.setUseSsl(this.config.ssl)
			.setDomain(this.config.domain)
			.setPort(this.config.port)
			.setEndpoint(endpoint)
			.setHeaders(headers ? headers : this.defaultRequestHeaders())
			.setResponseType(responseType)
			.build();
	}

	/**
	 *
	 */
	public post(endpoint: string, payload: string | object | ArrayBuffer, headers?: Record<string, string>, responseType: BuilderResponse = "json") {
		return this.requestBuilder
			.setMethod("POST")
			.setUseSsl(this.config.ssl)
			.setDomain(this.config.domain)
			.setPort(this.config.port)
			.setEndpoint(endpoint)
			.setBody(payload)
			.setHeaders(headers ? headers : this.defaultRequestHeaders())
			.setResponseType(responseType)
			.build();
	}

	/**
	 *
	 */
	public patch(endpoint: string, payload: string | object | ArrayBuffer, headers?: Record<string, string>, responseType: BuilderResponse = "json") {
		return this.requestBuilder
			.setMethod("PATCH")
			.setUseSsl(this.config.ssl)
			.setDomain(this.config.domain)
			.setPort(this.config.port)
			.setEndpoint(endpoint)
			.setBody(payload)
			.setHeaders(headers ? headers : this.defaultRequestHeaders())
			.setResponseType(responseType)
			.build();
	}

	/**
	 *
	 */
	public delete(endpoint: string, headers?: Record<string, string>, responseType: BuilderResponse = "json") {
		return this.requestBuilder
			.setMethod("DELETE")
			.setUseSsl(this.config.ssl)
			.setDomain(this.config.domain)
			.setPort(this.config.port)
			.setEndpoint(endpoint)
			.setHeaders(headers ? headers : this.defaultRequestHeaders())
			.setResponseType(responseType)
			.build();
	}

	/**
	 * Construct the default HTTP request headers.
	 * @returns the default headers for this object's CRUD requests.
	 */
	public defaultRequestHeaders(): Record<string, string> {
		if (!this.config) throw new Error(`${this.name}: Call setup first.`);

		const defaultHeaders = { "Content-Type": "application/json" };
		if (this.accessToken) defaultHeaders["Authorization"] = `Bearer ${this.accessToken}`;

		return defaultHeaders;
	}

	/**
	 *
	 * @param config
	 */
	public setConfig(config: IExternalConfig) {
		this.config = config;
	}

	/**
	 *
	 * @param token
	 */
	public setAccessToken(token: string) {
		this.accessToken = token;
	}
}
