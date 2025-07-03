/**
 * DOC
 */
export interface IExternalFacade {
	/**
	 *
	 * @param data
	 * @returns
	 */
	processSeverSentEvent(data: unknown): Promise<void>;

	/**
	 * Get the full URL of the external API's SSE endpoint.
	 * @example
	 * ```typescript
	 * public getEventsUrl() {
	 *    const baseUrl = super.getApiUrl();
	 *    return new URL("/endpoint", baseUrl);
	 * }
	 * ```
	 * @returns The full SSE URL.
	 */
	getEventsUrl(): URL;

	/**
	 *
	 * @param response
	 * @returns
	 */
	handleLoginResponse(response: unknown): string;

	/**
	 *
	 * @param endpoint
	 * @param credentials
	 * @param requestType
	 * @returns
	 */
	login(endpoint: string, credentials: object): Promise<void>;

	/**
	 * Send a GET request.
	 * @param
	 * @returns the request's raw response.
	 */
	get(endpoint: string): Promise<unknown>;

	/**
	 * Send a POST request.
	 * @param
	 * @param
	 * @returns the request's raw response.
	 */
	post(endpoint: string, payload: string | object | ArrayBuffer): Promise<unknown>;

	/**
	 * Send a PATCH request.
	 * @param
	 * @param
	 * @returns the request's raw response.
	 */
	patch(endpoint: string, payload: string | object | ArrayBuffer): Promise<unknown>;

	/**
	 * Send a DELETE request.
	 * @param
	 * @returns the request's raw response.
	 */
	delete(endpoint: string): Promise<unknown>;
}
