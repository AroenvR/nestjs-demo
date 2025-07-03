import { HttpStatus, Injectable } from "@nestjs/common";
import { WinstonAdapter } from "../../../infrastructure/logging/adapters/WinstonAdapter";
import { ILogger } from "../../../infrastructure/logging/ILogger";

/**
 * The base interface an {@link IRequestBuilder} must adhere to.
 *
 * @property method - {@link BuilderMethods} | null - The HTTP method to use.
 * @property useSsl - boolean | null - Whether to use SSL or not.
 * @property port - number | null - Which port to use.
 * @property domain - string | null - Which domain the URL resides at.
 * @property endpoint - string | object | ArrayBuffer | null - Which endpoint to call.
 * @property headers - Record<string, string> | null - Which headers to use.
 * @property responseType - {@link BuilderResponse} | null - The expected response type.
 */
interface IBaseRequestBuilder {
	method: BuilderMethods | null;
	useSsl: boolean | null;
	port: number | null;
	domain: string | null;
	endpoint: string | null;
	body: string | object | ArrayBuffer | null;
	headers: Record<string, string> | null;
	responseType: BuilderResponse | null;

	/**
	 * Execute the built request.
	 */
	execute(): Promise<any>;
}

/**
 * The interface any RequestBuilder must adhere to.
 * Extends the {@link IBaseRequestBuilder} interface.
 */
export interface IRequestBuilder extends IBaseRequestBuilder {
	/**
	 * Build the RequestBuilder based on the {@link IBaseRequestBuilder} interface.
	 */
	build(): IBaseRequestBuilder;

	setMethod(method: BuilderMethods): RequestBuilder;
	setUseSsl(ssl: boolean): RequestBuilder;
	setPort(port: number | null): RequestBuilder;
	setDomain(domain: string): RequestBuilder;
	setEndpoint(endpoint: string | null): RequestBuilder;
	setBody(body: string | object | ArrayBuffer | null): RequestBuilder;
	setHeaders(headers: Record<string, string>): RequestBuilder;
	setResponseType(responseType: BuilderResponse): RequestBuilder;
}

/**
 * HTTP Builder's supported response types.
 */
export type BuilderResponse = "json" | "arrayBuffer";

/**
 * HTTP Builder's supported request methods.
 */
export type BuilderMethods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * A builder for creating dynamic HTTP(s) requests.
 */
@Injectable()
export class RequestBuilder implements IRequestBuilder {
	private readonly logger: ILogger;
	private readonly name: string;
	private _method: BuilderMethods | null = null;
	private _useSsl: boolean | null = null;
	private _port: number | null = null;
	private _domain: string | null = null;
	private _endpoint: string | null = null;
	private _body: string | object | ArrayBuffer | null = null;
	private _headers: Record<string, string> | null = null;
	private _responseType: BuilderResponse | null = null;

	constructor(logAdapter: WinstonAdapter) {
		this.name = this.constructor.name;
		this.logger = logAdapter.getPrefixedLogger(this.name);
	}

	/**
	 *
	 */
	public async execute() {
		this.logger.debug(`Executing HTTP(s) request.`);

		const url = this.urlBuilder();
		const payload = this.payloadBuilder();

		const response = await fetch(url, payload)
			.then((response: Response) => {
				if (response.ok) {
					if (response.status === 204) return; // No content response
					if (this.responseType === "json") return response.json();
					else if (this.responseType === "arrayBuffer") return response.arrayBuffer();
					else throw new Error(`${this.name}: Response type ${this.responseType} not yet supported.`);
				}

				if (response.status === 401) {
					return response.json();
				}

				// @Security - This could log sensitive data (response payloads from external API's)
				this.logger.verbose(`Full response: ${JSON.stringify(response)}`);
				throw new Error(`${this.name}: ${this.method} request to ${url} | Status: ${response.status} | Message: ${response.statusText}`);
			})
			.catch((err) => {
				throw new Error(`${this.name}: error occurred: ${err}`);
			});

		this.setMethod("GET");
		this.setUseSsl(false);
		this.setPort(null);
		this.setDomain("");
		this.setEndpoint(null);
		this.setBody(null);
		this.setHeaders({});
		this.setResponseType("json");

		return response;
	}

	/**
	 *
	 */
	public build(): IBaseRequestBuilder {
		this.logger.debug(`Building the builder.`);

		return {
			method: this.method,
			useSsl: this.useSsl,
			port: this.port,
			domain: this.domain,
			endpoint: this.endpoint,
			body: this.body,
			headers: this.headers,
			responseType: this.responseType,
			execute: this.execute.bind(this),
		};
	}

	/**
	 * Build the URL.
	 * @returns a new URL object.
	 */
	private urlBuilder() {
		this.logger.debug(`Building URL.`);

		let url = "";
		url += this.useSsl ? "https://" : "http://";
		url += this.domain;

		if (this.port) url += `:${this.port}`;
		if (this.endpoint) {
			if (this.endpoint.startsWith("/")) url += this.endpoint;
			else url += `/${this.endpoint}`;
		}

		// @Security - On older API's, sensitive data can exist in URL's so this could log sensitive data.
		this.logger.verbose(`URL being built: ${url}`);
		return new URL(url);
	}

	/**
	 * Build the payload.
	 * @returns A valid payload object.
	 */
	private payloadBuilder() {
		this.logger.debug(`Building payload.`);

		interface Payload {
			method: BuilderMethods;
			body?: string | ArrayBuffer;
			headers: Record<string, string>;
		}

		const payload: Payload = {
			method: this.method,
			headers: this.headers,
		};

		if (this.body) {
			if (typeof this.body === "string") payload.body = this.body;
			if (typeof this.body === "object") payload.body = JSON.stringify(this.body);
			if (this.body instanceof ArrayBuffer) payload.body = this.body;
		}

		// @Security - This can log sensitive data (f.ex. payloads to external API's).
		this.logger.verbose(`Payload being built: ${JSON.stringify(payload)}`);
		return payload;
	}

	/* Getters & Setters */

	public get method() {
		if (!this._method) throw new Error(`${this.name}: Method was not set.`);
		return this._method;
	}
	public setMethod(method: BuilderMethods) {
		this._method = method;
		return this;
	}

	public get useSsl() {
		if (this._useSsl === null) throw new Error(`${this.name}: Use SSL was not set.`);
		return this._useSsl;
	}
	public setUseSsl(ssl: boolean) {
		this._useSsl = ssl;
		return this;
	}

	public get port() {
		return this._port;
	}
	public setPort(port: number | null) {
		this._port = port;
		return this;
	}

	public get domain() {
		if (!this._domain) throw new Error(`${this.name}: Domain was not set.`);
		return this._domain;
	}
	public setDomain(domain: string) {
		this._domain = domain;
		return this;
	}

	public get endpoint() {
		return this._endpoint;
	}
	public setEndpoint(endpoint: string | null) {
		this._endpoint = endpoint;
		return this;
	}

	public get body() {
		return this._body;
	}
	public setBody(body: string | object | ArrayBuffer | null) {
		this._body = body;
		return this;
	}

	public get headers() {
		if (!this._headers) throw new Error(`${this.name}: Headers were not set.`);
		return this._headers;
	}
	public setHeaders(headers: Record<string, string>) {
		this._headers = headers;
		return this;
	}

	public get responseType() {
		if (!this._responseType) throw new Error(`${this.name}: Response type was not defined.`);
		return this._responseType;
	}
	public setResponseType(responseType: BuilderResponse) {
		this._responseType = responseType;
		return this;
	}
}
