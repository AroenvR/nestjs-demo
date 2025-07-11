import { HttpExceptionMessages } from "../../common/enums/HttpExceptionMessages";

/**
 * Interface for HTTP error response objects.
 * This interface defines the structure of error responses returned by HTTP exception filters.
 * @property statusCode - The HTTP status code of the error response.
 * @property timestamp - The timestamp when the error occurred.
 * @property path - The request path that caused the error.
 * @property message - A {@link HttpExceptionMessages} enum value representing the error message.
 */
export interface IHttpErrorResponseObj {
	statusCode: number;
	timestamp: number;
	path: string;
	message: HttpExceptionMessages;
}
