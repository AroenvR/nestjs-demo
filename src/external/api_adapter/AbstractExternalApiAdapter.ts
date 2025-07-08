import { ConfigService } from "@nestjs/config";
import { BuilderResponse, IBaseRequestBuilder, RequestBuilder } from "../../common/utility/request_builder/RequestBuilder";
import { ILogger, IPrefixedLogger } from "../../infrastructure/logging/ILogger";
import { IExternalCrudService } from "../services/IExternalCrudService";
import { IServerConfig } from "../../infrastructure/configuration/IServerConfig";
import { IExternalConfig } from "../IExternalConfig";
import { Injectable } from "@nestjs/common";

/**
 * todo: doc and test
 */
@Injectable()
export abstract class AbstractExternalApiAdapter implements IExternalCrudService {
	private accessToken: string | null = null;
	protected readonly name: string;
	protected readonly logger: ILogger;
	protected config: IExternalConfig;

	constructor(
		protected readonly logAdapter: IPrefixedLogger,
		protected readonly requestBuilder: RequestBuilder,
		protected readonly configService: ConfigService<IServerConfig>,
	) {
		this.name = this.constructor.name;
		this.logger = logAdapter.getPrefixedLogger(this.name);
		this.config = this.configService.get(this.configString());
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
	 * @param token
	 */
	public setAccessToken(token: string) {
		this.accessToken = token;
	}

	/**
	 * doc
	 */
	protected async executeRequest(request: IBaseRequestBuilder) {
		const currentToken = this.accessToken;

		try {
			const response = await request.execute();
			if (response.ok) return response;

			if (response.status === 401) {
				// const loginRequest = this.service.post(this.loginData.endpoint, this.loginData.credentials);
				// const loginResponse = loginRequest.execute();
				// const newToken = this.handleLoginResponse(loginResponse);
				// if (currentToken === newToken) throw new Error(`${this.name}: Access token was not refreshed.`);
				// this.setAccessToken(this.accessToken);
				// request.headers = this.service.defaultRequestHeaders();
				// const retry = await request.execute();
				// if (retry.ok) return retry;
				// throw new Error(`${this.name}: Request RETRY failed.`);
			}
		} catch (err) {
			this.logger.error(`Request to ${request.domain + "/" + request.endpoint} failed.`, err);
			return null;
		}
	}

	/**
	 *
	 */
	public abstract configString(): keyof IServerConfig;
}
