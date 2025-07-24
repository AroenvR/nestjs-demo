import { HttpStatus, Injectable } from "@nestjs/common";
import { WinstonAdapter } from "../logging/adapters/WinstonAdapter";
import { ILogger } from "../logging/ILogger";
import { HttpExceptionMessages } from "../../../common/enums/HttpExceptionMessages";
import { IHttpErrorObj } from "src/http_api/filters/IHttpErrorResponseObj";

/**
 * The base interface an {@link IRequestBuilder} must adhere to.
 *
 * @property method - {@link TRequestBuilderMethods} | null - The HTTP method to use.
 * @property useSsl - boolean | null - Whether to use SSL or not.
 * @property port - number | null - Which port to use.
 * @property domain - string | null - Which domain the URL resides at.
 * @property endpoint - string | object | ArrayBuffer | null - Which endpoint to call.
 * @property headers - Record<string, string> | null - Which headers to use.
 * @property responseType - {@link TRequestBuilderResponse} | null - The expected response type.
 */
export interface IBaseRequestBuilder {
	method: TRequestBuilderMethods | null;
	useSsl: boolean | null;
	port: number | null;
	domain: string | null;
	endpoint: string | null;
	body: string | object | ArrayBuffer | null;
	headers: Record<string, string> | null;
	responseType: TRequestBuilderResponse | null;
	knownErrors: Map<HttpStatus, HttpExceptionMessages>;

	/**
	 * Execute the built request.
	 */
	execute(): Promise<TRequestBuilderResponseTypeMap[TRequestBuilderResponse]>;
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

	setMethod(method: TRequestBuilderMethods): RequestBuilder;
	setUseSsl(ssl: boolean): RequestBuilder;
	setPort(port: number | null): RequestBuilder;
	setDomain(domain: string): RequestBuilder;
	setEndpoint(endpoint: string | null): RequestBuilder;
	setBody(body: string | object | ArrayBuffer | null): RequestBuilder;
	setHeaders(headers: Record<string, string>): RequestBuilder;
	setResponseType(responseType: TRequestBuilderResponse): RequestBuilder;
}

/**
 * HTTP Builder's supported request methods.
 */
export type TRequestBuilderMethods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * HTTP Builder's supported response types.
 */
export type TRequestBuilderResponse = "text" | "json" | "arrayBuffer";

/**
 * A map of supported response types to their corresponding return types.
 * This is used to ensure type safety when handling different response types.
 */
export type TRequestBuilderResponseTypeMap = {
	text: Promise<string>;
	json: Promise<object>; // Replace `any` with a more specific type if possible
	arrayBuffer: Promise<ArrayBuffer>;
};

/**
 * A builder for creating dynamic HTTP(s) requests.
 */
@Injectable()
export class RequestBuilder implements IRequestBuilder {
	private readonly logger: ILogger;
	private readonly name: string;
	private _method: TRequestBuilderMethods | null = null;
	private _useSsl: boolean | null = null;
	private _port: number | null = null;
	private _domain: string | null = null;
	private _endpoint: string | null = null;
	private _body: string | object | ArrayBuffer | null = null;
	private _headers: Record<string, string> | null = null;
	private _responseType: TRequestBuilderResponse | null = null;
	public readonly knownErrors: Map<HttpStatus, HttpExceptionMessages> = new Map();

	constructor(protected readonly logAdapter: WinstonAdapter) {
		this.name = this.constructor.name;
		this.logger = logAdapter.getPrefixedLogger(this.name);
		this.registerKnownErrorsResponses();
	}

	/**
	 *
	 */
	public async execute(): Promise<TRequestBuilderResponseTypeMap[TRequestBuilderResponse]> {
		this.logger.debug(`Executing HTTP(s) ${this.method} request`);

		const url = this.urlBuilder();
		const payload = this.payloadBuilder();

		const response = await fetch(url, payload)
			.then((response: Response) => {
				if (response.ok) {
					this.logger.debug(`Successful ${this.method} request to ${url.hostname} | Status: ${response.status}`);

					if (response.status === HttpStatus.NO_CONTENT) return null; // ✅ SAFE GUARD
					if (this.responseType === "text") return response.text();
					if (this.responseType === "json") return response.json();
					if (this.responseType === "arrayBuffer") return response.arrayBuffer();
					else throw new Error(`${this.name}: Response type \"${this.responseType}\" is not supported.`);
				}

				const errorResponse = this.handleErrorResponse(response);

				this.logger.error(
					`Failed ${this.method} request to ${url.hostname} | Status: ${errorResponse.status} | Message: ${errorResponse.message}`,
				);
				return errorResponse;
			})
			.catch((err) => {
				throw new Error(`${this.name}: error occurred sending ${this.method} request to ${url.hostname}: ${err}`);
			});

		this.setMethod("GET");
		this.setUseSsl(false);
		this.setPort(null);
		this.setDomain("");
		this.setEndpoint(null);
		this.setBody(null);
		this.setHeaders({});
		this.setResponseType("json");

		return response as TRequestBuilderResponseTypeMap[TRequestBuilderResponse];
	}

	/**
	 *
	 */
	public build(): IBaseRequestBuilder {
		this.logger.verbose(`Building the builder.`);

		return {
			method: this.method,
			useSsl: this.useSsl,
			port: this.port,
			domain: this.domain,
			endpoint: this.endpoint,
			body: this.body,
			headers: this.headers,
			responseType: this.responseType,
			knownErrors: this.knownErrors,
			execute: this.execute.bind(this),
		};
	}

	/**
	 * Handle error responses from the fetch API.
	 * This method maps HTTP status codes to user-friendly error messages.
	 * @param response - The Response object from the fetch API.
	 * @returns An object containing the status and message of the error.
	 * @throws An error if the response status is not handled.
	 */
	private handleErrorResponse = (response: Response): IHttpErrorObj => {
		for (const [key, value] of this.knownErrors.entries()) {
			if (response.status === key) {
				return {
					status: key,
					message: value,
				};
			}
		}

		this.logger.error(`Unhandled error response code: ${response.status}`);
		return {
			status: response.status,
			message: HttpExceptionMessages.UNKNOWN,
		};
	};

	/**
	 * Registers known error responses for this adapter.
	 * This method maps HTTP status codes to user-friendly error messages.
	 * It is used to handle error responses from the external API.
	 */
	private registerKnownErrorsResponses() {
		this.knownErrors.set(HttpStatus.BAD_REQUEST, HttpExceptionMessages.BAD_REQUEST);
		this.knownErrors.set(HttpStatus.UNAUTHORIZED, HttpExceptionMessages.UNAUTHORIZED);
		this.knownErrors.set(HttpStatus.NOT_FOUND, HttpExceptionMessages.NOT_FOUND);
		this.knownErrors.set(HttpStatus.CONFLICT, HttpExceptionMessages.CONFLICT);
		this.knownErrors.set(HttpStatus.INTERNAL_SERVER_ERROR, HttpExceptionMessages.INTERNAL_SERVER_ERROR);
		this.knownErrors.set(HttpStatus.NOT_IMPLEMENTED, HttpExceptionMessages.NOT_IMPLEMENTED);
	}

	/**
	 * Build the URL.
	 * @returns a new URL object.
	 */
	private urlBuilder() {
		this.logger.verbose(`Building URL.`);

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
		this.logger.verbose(`Building payload.`);

		interface Payload {
			method: TRequestBuilderMethods;
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
	public setMethod(method: TRequestBuilderMethods) {
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
	public setResponseType(responseType: TRequestBuilderResponse) {
		this._responseType = responseType;
		return this;
	}
}
