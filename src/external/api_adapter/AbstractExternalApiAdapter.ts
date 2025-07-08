import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TRequestBuilderResponse, IBaseRequestBuilder, IRequestBuilder, RequestBuilder } from "../../common/utility/request_builder/RequestBuilder";
import { ILogger } from "../../infrastructure/logging/ILogger";
import { IServerConfig } from "../../infrastructure/configuration/IServerConfig";
import { assertExternalConfigSchema, IExternalConfig } from "../IExternalConfig";
import { HttpExceptionMessages } from "../../common/enums/HttpExceptionMessages";
import { IExternalApiAdapter } from "./IExternalApiAdapter";
import { WinstonAdapter } from "../../infrastructure/logging/adapters/WinstonAdapter";

/**
 * Abstract class for external API adapters.
 * This class provides methods for sending HTTP requests to external APIs,
 * including GET, POST, PATCH, and DELETE methods.
 * It also handles authentication by allowing login with credentials and managing access tokens.
 * It is intended to be extended by specific external API adapters.
 * - Implements the {@link IExternalApiAdapter} interface.
 */
@Injectable()
export abstract class AbstractExternalApiAdapter implements IExternalApiAdapter {
	private loginEndpoint: string | null = null;
	private credentials: object | null = null;
	private accessToken: string | null = null;
	protected readonly name: string;
	protected readonly logger: ILogger;
	protected config: IExternalConfig;

	constructor(
		protected readonly logAdapter: WinstonAdapter,
		protected readonly requestBuilder: IRequestBuilder,
		protected readonly configService: ConfigService<IServerConfig>,
	) {
		this.name = this.constructor.name;
		this.logger = logAdapter.getPrefixedLogger(this.name);

		const config = this.configService.get(this.configString());
		this.safeSetConfig(config);
	}

	/**
	 *
	 */
	public get(endpoint: string, headers?: Record<string, string>, responseType: TRequestBuilderResponse = "json") {
		const request = this.requestBuilder
			.setMethod("GET")
			.setUseSsl(this.config.ssl)
			.setDomain(this.config.domain)
			.setPort(this.config.port)
			.setEndpoint(endpoint)
			.setHeaders(headers ? headers : this.getAuthenticatedHeaders())
			.setResponseType(responseType)
			.build();

		return this.executeRequest(request);
	}

	/**
	 *
	 */
	public post(
		endpoint: string,
		payload: string | object | ArrayBuffer,
		headers?: Record<string, string>,
		responseType: TRequestBuilderResponse = "json",
	) {
		const request = this.requestBuilder
			.setMethod("POST")
			.setUseSsl(this.config.ssl)
			.setDomain(this.config.domain)
			.setPort(this.config.port)
			.setEndpoint(endpoint)
			.setBody(payload)
			.setHeaders(headers ? headers : this.getAuthenticatedHeaders())
			.setResponseType(responseType)
			.build();

		return this.executeRequest(request);
	}

	/**
	 *
	 */
	public patch(
		endpoint: string,
		payload: string | object | ArrayBuffer,
		headers?: Record<string, string>,
		responseType: TRequestBuilderResponse = "json",
	) {
		const request = this.requestBuilder
			.setMethod("PATCH")
			.setUseSsl(this.config.ssl)
			.setDomain(this.config.domain)
			.setPort(this.config.port)
			.setEndpoint(endpoint)
			.setBody(payload)
			.setHeaders(headers ? headers : this.getAuthenticatedHeaders())
			.setResponseType(responseType)
			.build();

		return this.executeRequest(request);
	}

	/**
	 *
	 */
	public delete(endpoint: string, headers?: Record<string, string>, responseType: TRequestBuilderResponse = "json") {
		const request = this.requestBuilder
			.setMethod("DELETE")
			.setUseSsl(this.config.ssl)
			.setDomain(this.config.domain)
			.setPort(this.config.port)
			.setEndpoint(endpoint)
			.setHeaders(headers ? headers : this.getAuthenticatedHeaders())
			.setResponseType(responseType)
			.build();

		return this.executeRequest(request);
	}

	/**
	 * Construct the default HTTP request headers.
	 * @returns the default headers for this object's CRUD requests.
	 */
	public defaultRequestHeaders(): Record<string, string> {
		const defaultHeaders = {
			Accept: "application/json",
			"Content-Type": "application/json",
		};

		return defaultHeaders;
	}

	/**
	 * Gets the authenticated headers for a request.
	 * If an access token is set, it adds the Authorization header with the Bearer token
	 * to the default request headers.
	 * If no access token is set, it returns the default request headers.
	 * @returns the headers for authenticated requests.
	 */
	private getAuthenticatedHeaders(): Record<string, string> {
		if (!this.accessToken) return this.defaultRequestHeaders();

		// This private function exists because we want to have the default headers be testable
		// while we don't want to provide public access to our access token.

		return {
			...this.defaultRequestHeaders(),
			Authorization: `Bearer ${this.accessToken}`,
		};
	}

	/**
	 * Logs in to the external API using the provided endpoint and credentials.
	 * This method sets the login endpoint and credentials for future requests.
	 * It sends a POST request to the specified endpoint with the provided credentials.
	 * If the request is successful, it sets the access token for authenticated requests.
	 * @param endpoint - The endpoint to send the login request to.
	 * @param credentials - The credentials to use for logging in.
	 * @throws Error if the login request does not return a response.
	 */
	public async login(endpoint: string, credentials: object) {
		this.logger.log(`Logging in to ${this.config.domain}`);

		if (!this.loginEndpoint) this.loginEndpoint = endpoint;
		if (!this.credentials) this.credentials = credentials;

		const request = this.requestBuilder
			.setMethod("POST")
			.setUseSsl(this.config.ssl)
			.setDomain(this.config.domain)
			.setPort(this.config.port)
			.setEndpoint(endpoint)
			.setBody(credentials)
			.setHeaders(this.defaultRequestHeaders())
			.setResponseType("text")
			.build();

		const response = await request.execute();

		if (!response) throw new Error(`${this.name}: Login request did not return a response.`);
		if (typeof response === "string") this.setAccessToken(response);
	}

	/**
	 * Sets the access token for authenticated requests.
	 * @param token - The access token to set.
	 */
	public setAccessToken(token: string) {
		this.accessToken = token;
	}

	/**
	 * Executes the provided request and handles errors.
	 * If the request returns an unauthorized response, it retries the request after logging in again.
	 * @param request The request to execute.
	 * @returns The response of the executed request or null if an error occurred.
	 */
	protected async executeRequest(request: IBaseRequestBuilder) {
		this.logger.debug(`Executing ${request.method} request to Domain: ${request.domain} | Endpoint: ${request.endpoint}`);

		try {
			let response = await request.execute();
			if (response === HttpExceptionMessages.UNAUTHORIZED) {
				response = await this.retryUnauthorizedRequest(request);
			}

			return response;
		} catch (err) {
			this.logger.error(`Request to ${request.domain + "/" + request.endpoint} failed.`, err);
			return null;
		}
	}

	/**
	 * Retries an unauthorized request by first trying to log in again.
	 * If the login is successful and the access token has changed, it retries the original request
	 * with the new access token.
	 * @returns The response of the retried request or "unauthorized".
	 */
	private async retryUnauthorizedRequest(request: IBaseRequestBuilder) {
		this.logger.debug(`Got a ${HttpExceptionMessages.UNAUTHORIZED} response. Retrying request.`);

		if (!this.loginEndpoint || !this.credentials) {
			this.logger.warn(`No credentials are set. Aborting retry request.`);
			return HttpExceptionMessages.UNAUTHORIZED;
		}

		const requestClone = new RequestBuilder(this.logAdapter)
			.setMethod(request.method)
			.setDomain(request.domain)
			.setPort(request.port)
			.setEndpoint(request.endpoint)
			.setHeaders(request.headers)
			.setBody(request.body)
			.setUseSsl(request.useSsl)
			.setResponseType(request.responseType);

		const currentToken = this.accessToken;
		await this.login(this.loginEndpoint, this.credentials);

		if (this.accessToken === currentToken) {
			this.logger.debug(`Access token did not change after retrying login. Aborting retry request.`);
			return HttpExceptionMessages.UNAUTHORIZED;
		}

		this.logger.debug(
			`Credentials were updated. Retrying ${request.method} request to Domain: ${request.domain} | Endpoint: ${request.endpoint}`,
		);
		return requestClone.setHeaders(this.getAuthenticatedHeaders()).build().execute();
	}

	/**
	 * Safely sets the configuration object for this adapter.
	 * It validates the configuration against the external configuration schema.
	 * @param config - The configuration object to set.
	 * @throws Error if the configuration does not fit the external configuration JSON schema.
	 */
	private safeSetConfig(config: IExternalConfig) {
		try {
			assertExternalConfigSchema(config);
			this.config = config;
		} catch (error) {
			throw new Error(`${this.name}: Configuration object did not fit the external configuration JSON schema: ${error}`);
		}
	}

	/**
	 * Returns the key of the server configuration object that this adapter uses.
	 */
	public abstract configString(): keyof IServerConfig;
}
