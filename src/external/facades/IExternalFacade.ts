import { IExternalCrudService } from "../services/IExternalCrudService";

/**
 * DOC
 */
export interface IExternalFacade extends IExternalCrudService {
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
}
