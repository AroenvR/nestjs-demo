import { TRequestBuilderResponse } from "src/common/utility/request_builder/RequestBuilder";

/**
 * Interface for an External API Adapter.
 * This interface defines methods for sending HTTP requests
 * to external APIs, including GET, POST, PATCH, and DELETE methods.
 */
export interface IExternalApiAdapter {
	/**
	 * Send a GET request.
	 * @param endpoint - The endpoint to send the request to.
	 * @param headers - Optional headers to include in the request.
	 * @param responseType - The expected response type (default is "json").
	 * @returns the request's raw response.
	 */
	get(endpoint: string, headers?: Record<string, string>, responseType?: TRequestBuilderResponse): Promise<string | ArrayBuffer | object>;

	/**
	 * Send a POST request.
	 * @param endpoint - The endpoint to send the request to.
	 * @param payload - The data to send in the request body.
	 * @param headers - Optional headers to include in the request.
	 * @param responseType - The expected response type (default is "json").
	 * @returns the request's raw response.
	 */
	post(
		endpoint: string,
		payload: string | object | ArrayBuffer,
		headers?: Record<string, string>,
		responseType?: TRequestBuilderResponse,
	): Promise<string | ArrayBuffer | object>;

	/**
	 * Send a PATCH request.
	 * @param endpoint - The endpoint to send the request to.
	 * @param payload - The data to send in the request body.
	 * @param headers - Optional headers to include in the request.
	 * @param responseType - The expected response type (default is "json").
	 * @returns the request's raw response.
	 */
	patch(
		endpoint: string,
		payload: string | object | ArrayBuffer,
		headers?: Record<string, string>,
		responseType?: TRequestBuilderResponse,
	): Promise<string | ArrayBuffer | object>;

	/**
	 * Send a DELETE request.
	 * @param endpoint - The endpoint to send the request to.
	 * @param headers - Optional headers to include in the request.
	 * @param responseType - The expected response type (default is "json").
	 * @returns the request's raw response.
	 */
	delete(endpoint: string, headers?: Record<string, string>, responseType?: TRequestBuilderResponse): Promise<string | ArrayBuffer | object>;
}
