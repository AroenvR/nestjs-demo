import { BuilderResponse } from "../../common/utility/request_builder/RequestBuilder";

/**
 * DOC
 */
export interface IExternalCrudService {
	/**
	 * Send a GET request.
	 * @param
	 * @param
	 * @param
	 * @returns the request's raw response.
	 */
	get(endpoint: string, headers?: Record<string, string>, responseType?: BuilderResponse): Promise<unknown>;

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
		responseType?: BuilderResponse,
	): Promise<unknown>;

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
		responseType?: BuilderResponse,
	): Promise<unknown>;

	/**
	 * Send a DELETE request.
	 * @param
	 * @param
	 * @param
	 * @returns the request's raw response.
	 */
	delete(endpoint: string, headers?: Record<string, string>, responseType?: BuilderResponse): Promise<unknown>;
}
