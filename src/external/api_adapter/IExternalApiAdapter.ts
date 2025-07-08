import { TRequestBuilderResponse } from "src/common/utility/request_builder/RequestBuilder";

/**
 * Interface for an External API Adapter.
 * This interface defines methods for sending HTTP requests
 * to external APIs, including GET, POST, PATCH, and DELETE methods.
 */
export interface IExternalApiAdapter {
	/**
	 * Send a GET request.
	 * @param
	 * @param
	 * @param
	 * @returns the request's raw response.
	 */
	get(
		endpoint: string,
		headers?: Record<string, string>,
		responseType?: TRequestBuilderResponse,
	): Promise<string | ArrayBuffer | Record<string, unknown>>;

	/**
	 * Send a POST request.
	 * @param
	 * @param
	 * @param
	 * @param
	 * @returns the request's raw response.
	 */
	post(
		endpoint: string,
		payload: string | object | ArrayBuffer,
		headers?: Record<string, string>,
		responseType?: TRequestBuilderResponse,
	): Promise<string | ArrayBuffer | Record<string, unknown>>;

	/**
	 * Send a PATCH request.
	 * @param
	 * @param
	 * @param
	 * @param
	 * @returns the request's raw response.
	 */
	patch(
		endpoint: string,
		payload: string | object | ArrayBuffer,
		headers?: Record<string, string>,
		responseType?: TRequestBuilderResponse,
	): Promise<string | ArrayBuffer | Record<string, unknown>>;

	/**
	 * Send a DELETE request.
	 * @param
	 * @param
	 * @param
	 * @returns the request's raw response.
	 */
	delete(
		endpoint: string,
		headers?: Record<string, string>,
		responseType?: TRequestBuilderResponse,
	): Promise<string | ArrayBuffer | Record<string, unknown>>;
}
